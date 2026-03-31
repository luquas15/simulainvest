/**
 * assetApi.js — Preços ao vivo de criptomoedas e câmbio
 *
 * CoinGecko (gratuito, sem chave, sem CORS):
 *   https://api.coingecko.com/api/v3/simple/price
 *
 * Frankfurter (gratuito, sem chave, sem CORS):
 *   https://api.frankfurter.app/latest
 */

const CACHE_KEY = 'simulainvest-asset-prices';
const CACHE_TTL = 1000 * 60 * 15; // 15 minutos

// ─── Fetchers ─────────────────────────────────────────────────────────────────

async function fetchCoinGecko() {
  const res = await fetch(
    'https://api.coingecko.com/api/v3/simple/price' +
    '?ids=bitcoin,ethereum' +
    '&vs_currencies=brl' +
    '&include_24hr_change=true' +
    '&include_7d_change=true',
    { signal: AbortSignal.timeout(8000) }
  );
  if (!res.ok) throw new Error(`CoinGecko HTTP ${res.status}`);
  return res.json();
}

async function fetchFrankfurter() {
  const res = await fetch(
    'https://api.frankfurter.app/latest?from=USD&to=BRL',
    { signal: AbortSignal.timeout(8000) }
  );
  if (!res.ok) throw new Error(`Frankfurter HTTP ${res.status}`);
  const data = await res.json();
  return data.rates?.BRL ?? null;
}

// ─── API principal ────────────────────────────────────────────────────────────

export async function fetchAssetPrices() {
  const cached = getCachedAssetPrices();
  if (cached) return cached;

  const [cryptoRes, usdRes] = await Promise.allSettled([
    fetchCoinGecko(),
    fetchFrankfurter(),
  ]);

  const crypto = cryptoRes.status === 'fulfilled' ? cryptoRes.value : null;
  const usdBrl = usdRes.status   === 'fulfilled' ? usdRes.value  : null;

  const prices = {
    btcBrl:       crypto?.bitcoin?.brl                  ?? null,
    ethBrl:       crypto?.ethereum?.brl                 ?? null,
    btcChange24h: crypto?.bitcoin?.brl_24h_change       ?? null,
    ethChange24h: crypto?.ethereum?.brl_24h_change      ?? null,
    btcChange7d:  crypto?.bitcoin?.brl_7d_change        ?? null,
    ethChange7d:  crypto?.ethereum?.brl_7d_change       ?? null,
    usdBrl,
    source:    (crypto || usdBrl) ? 'live' : 'unavailable',
    fetchedAt: Date.now(),
  };

  if (prices.source === 'live') setCachedAssetPrices(prices);
  return prices;
}

// ─── Cache (localStorage, TTL 15 min) ─────────────────────────────────────────

export function getCachedAssetPrices() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.fetchedAt) return null;
    if (Date.now() - data.fetchedAt > CACHE_TTL) return null;
    return data;
  } catch {
    return null;
  }
}

export function setCachedAssetPrices(prices) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(prices)); } catch {}
}

export function clearAssetPricesCache() {
  localStorage.removeItem(CACHE_KEY);
}
