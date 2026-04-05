/**
 * brapiApi.js — brapi.dev (B3 stocks, FIIs, ETFs)
 * Gratuito com token=FREE (limitado mas funcional para demo)
 * Docs: https://brapi.dev/docs
 */

const BASE  = 'https://brapi.dev/api';
const TOKEN = 'FREE'; // troque por token da conta gratuita para mais requisições

// Mapa range → interval para brapi.dev
export const BR_INTERVAL_MAP = {
  '5m':  { range: '1d',  interval: '5m'  },
  '15m': { range: '1d',  interval: '15m' },
  '30m': { range: '5d',  interval: '30m' },
  '1h':  { range: '1mo', interval: '1h'  },
  '1d':  { range: '3mo', interval: '1d'  },
  '1wk': { range: '1y',  interval: '1wk' },
};

/**
 * Busca cotações atuais de uma lista de tickers.
 */
export async function fetchBrapiQuotes(tickers) {
  const symbols = tickers.join(',');
  const res = await fetch(
    `${BASE}/quote/${symbols}?token=${TOKEN}&fundamental=false`,
    { signal: AbortSignal.timeout(10000) }
  );
  if (!res.ok) throw new Error(`brapi HTTP ${res.status}`);
  const data = await res.json();
  return data.results ?? [];
}

/**
 * Busca dados históricos (OHLCV) de um ticker para o gráfico.
 * Retorna no formato esperado pelo lightweight-charts.
 */
export async function fetchBrapiChart(ticker, intervalKey = '1d') {
  const { range, interval } = BR_INTERVAL_MAP[intervalKey] ?? BR_INTERVAL_MAP['1d'];
  const res = await fetch(
    `${BASE}/quote/${ticker}?range=${range}&interval=${interval}&token=${TOKEN}`,
    { signal: AbortSignal.timeout(12000) }
  );
  if (!res.ok) throw new Error(`brapi chart HTTP ${res.status}`);
  const data = await res.json();
  const result = data.results?.[0];
  if (!result) throw new Error('Ativo não encontrado');

  const history = result.historicalDataPrice ?? [];
  const candles = history
    .filter(c => c.open && c.high && c.low && c.close)
    .map(c => ({
      time:   c.date,           // já é UNIX seconds
      open:   c.open,
      high:   c.high,
      low:    c.low,
      close:  c.close,
      volume: c.volume ?? 0,
    }))
    .sort((a, b) => a.time - b.time);

  return {
    candles,
    ticker: {
      price:      result.regularMarketPrice,
      change:     result.regularMarketChange,
      changePct:  result.regularMarketChangePercent,
      high24h:    result.regularMarketDayHigh,
      low24h:     result.regularMarketDayLow,
      volume:     result.regularMarketVolume,
      prevClose:  result.regularMarketPreviousClose,
      name:       result.longName ?? result.shortName ?? ticker,
      currency:   result.currency ?? 'BRL',
    },
  };
}
