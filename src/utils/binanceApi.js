/**
 * binanceApi.js — Binance REST + WebSocket
 * Gratuito, sem chave de API, sem CORS.
 *
 * REST:  https://api.binance.com/api/v3/klines
 * WS:    wss://stream.binance.com:9443/ws/{symbol}@kline_{interval}
 * Ticker:wss://stream.binance.com:9443/ws/{symbol}@ticker
 */

const BASE = 'https://api.binance.com/api/v3';
const WS_BASE = 'wss://stream.binance.com:9443/ws';

// ─── Candles históricos ────────────────────────────────────────────────────

export async function fetchCandles(symbol, interval, limit = 200) {
  const res = await fetch(
    `${BASE}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
    { signal: AbortSignal.timeout(10000) }
  );
  if (!res.ok) throw new Error(`Binance klines HTTP ${res.status}`);
  const raw = await res.json();

  // Binance retorna: [openTime, open, high, low, close, volume, ...]
  return raw.map(k => ({
    time:  Math.floor(k[0] / 1000), // UNIX seconds (lightweight-charts format)
    open:  parseFloat(k[1]),
    high:  parseFloat(k[2]),
    low:   parseFloat(k[3]),
    close: parseFloat(k[4]),
    volume:parseFloat(k[5]),
  }));
}

// ─── Ticker 24h (preço, variação, high/low) ───────────────────────────────

export async function fetchTicker24h(symbol) {
  const res = await fetch(`${BASE}/ticker/24hr?symbol=${symbol}`, {
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Binance ticker HTTP ${res.status}`);
  const d = await res.json();
  return {
    price:      parseFloat(d.lastPrice),
    change24h:  parseFloat(d.priceChangePercent),
    high24h:    parseFloat(d.highPrice),
    low24h:     parseFloat(d.lowPrice),
    volume24h:  parseFloat(d.volume),
    quoteVolume:parseFloat(d.quoteVolume),
  };
}

// ─── WebSocket — candles em tempo real ────────────────────────────────────

export function subscribeKline(symbol, interval, onCandle, onError) {
  const stream = `${symbol.toLowerCase()}@kline_${interval}`;
  const ws = new WebSocket(`${WS_BASE}/${stream}`);

  ws.onmessage = (event) => {
    try {
      const { k } = JSON.parse(event.data);
      onCandle({
        time:   Math.floor(k.t / 1000),
        open:   parseFloat(k.o),
        high:   parseFloat(k.h),
        low:    parseFloat(k.l),
        close:  parseFloat(k.c),
        volume: parseFloat(k.v),
        closed: k.x, // true = candle fechado
      });
    } catch {}
  };

  ws.onerror = () => onError?.('WebSocket error');
  ws.onclose = () => onError?.('WebSocket closed');

  return () => ws.close();
}

// ─── WebSocket — ticker ao vivo (preço instantâneo) ──────────────────────

export function subscribeTicker(symbol, onTick) {
  const ws = new WebSocket(`${WS_BASE}/${symbol.toLowerCase()}@miniTicker`);

  ws.onmessage = (event) => {
    try {
      const d = JSON.parse(event.data);
      onTick({
        price:  parseFloat(d.c),
        open:   parseFloat(d.o),
        high:   parseFloat(d.h),
        low:    parseFloat(d.l),
        volume: parseFloat(d.v),
      });
    } catch {}
  };

  return () => ws.close();
}
