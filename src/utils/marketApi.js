/**
 * marketApi.js — Integração com a API pública do Banco Central do Brasil
 * Docs: https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/
 * SGS:  https://api.bcb.gov.br/dados/serie/bcdata.sgs.{serie}/dados/ultimos/{n}
 *
 * Séries utilizadas:
 *  432   — Selic Meta (% a.a., decisão do Copom)
 *  12    — CDI over diário (% a.d.) → anualizado aqui
 *  13522 — IPCA acumulado 12 meses (%)
 *  226   — Poupança (% a.m.) → anualizado aqui
 */

const CACHE_KEY = 'simulainvest-market-data';
const CACHE_TTL = 1000 * 60 * 60 * 6; // 6 horas

const BCB = (serie, n = 1) =>
  `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${serie}/dados/ultimos/${n}?formato=json`;

// Anualiza taxa diária usando convenção 252 dias úteis
function dailyToAnnual(dailyPct) {
  return (Math.pow(1 + dailyPct / 100, 252) - 1) * 100;
}

// Anualiza taxa mensal
function monthlyToAnnual(monthlyPct) {
  return (Math.pow(1 + monthlyPct / 100, 12) - 1) * 100;
}

/**
 * Busca um único valor de uma série do SGS/BCB.
 * Retorna o valor numérico ou lança erro.
 */
async function fetchSerie(serie) {
  const res = await fetch(BCB(serie, 1), { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`BCB serie ${serie}: HTTP ${res.status}`);
  const data = await res.json();
  if (!data?.length) throw new Error(`BCB serie ${serie}: dados vazios`);
  return { valor: parseFloat(data[0].valor), data: data[0].data };
}

/**
 * Busca todas as taxas de mercado em paralelo.
 * Fallback automático para os valores hardcoded se a API falhar.
 */
export async function fetchMarketRates() {
  const FALLBACK = {
    selic:     14.75,
    cdi:       14.65,
    ipca12m:   5.48,
    poupanca:  6.17,
    source:    'fallback',
    fetchedAt: null,
    error:     null,
  };

  try {
    // Dispara todas as requisições em paralelo
    const [selicResult, cdiResult, ipcaResult, poupancaResult] = await Promise.allSettled([
      fetchSerie(432),   // Selic Meta % a.a.
      fetchSerie(12),    // CDI over diário % a.d.
      fetchSerie(13522), // IPCA acumulado 12m %
      fetchSerie(226),   // Poupança % a.m.
    ]);

    const selic    = selicResult.status    === 'fulfilled' ? selicResult.value.valor : FALLBACK.selic;
    const cdiDaily = cdiResult.status      === 'fulfilled' ? cdiResult.value.valor   : null;
    const ipca12m  = ipcaResult.status     === 'fulfilled' ? ipcaResult.value.valor  : FALLBACK.ipca12m;
    const poupMensal = poupancaResult.status === 'fulfilled' ? poupancaResult.value.valor : null;

    // CDI diário → anual (252 dias úteis)
    const cdi = cdiDaily !== null
      ? parseFloat(dailyToAnnual(cdiDaily).toFixed(2))
      : parseFloat((selic - 0.1).toFixed(2)); // CDI ≈ Selic - 0,10%

    // Poupança mensal → anual
    const poupanca = poupMensal !== null
      ? parseFloat(monthlyToAnnual(poupMensal).toFixed(2))
      : parseFloat((selic > 8.5 ? 6.17 : selic * 0.7).toFixed(2));

    // Data de referência (usa a data da Selic se disponível)
    const referenceDate = selicResult.status === 'fulfilled'
      ? selicResult.value.data
      : new Date().toLocaleDateString('pt-BR');

    const allFailed = [selicResult, cdiResult, ipcaResult, poupancaResult]
      .every(r => r.status === 'rejected');

    return {
      selic,
      cdi,
      ipca12m,
      poupanca,
      referenceDate,
      source:    allFailed ? 'fallback' : 'bcb',
      fetchedAt: Date.now(),
      error:     null,
    };
  } catch (err) {
    console.warn('[marketApi] Erro ao buscar taxas BCB, usando fallback:', err.message);
    return { ...FALLBACK, fetchedAt: Date.now(), error: err.message };
  }
}

// ─── Cache (localStorage, TTL de 6h) ─────────────────────────────────────────

export function getCachedRates() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (!cached?.fetchedAt) return null;
    if (Date.now() - cached.fetchedAt > CACHE_TTL) return null; // expirado
    return cached;
  } catch {
    return null;
  }
}

export function setCachedRates(rates) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(rates));
  } catch {
    // quota exceeded — ignora silenciosamente
  }
}

export function clearRatesCache() {
  localStorage.removeItem(CACHE_KEY);
}
