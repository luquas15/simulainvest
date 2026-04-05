import { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, CandlestickSeries, HistogramSeries } from 'lightweight-charts';
import { fetchCandles, fetchTicker24h, subscribeKline, subscribeTicker } from '../utils/binanceApi';
import { getCachedAssetPrices } from '../utils/assetApi';

// ─── Ativos disponíveis ───────────────────────────────────────────────────

const ASSETS = [
  { symbol: 'BTCUSDT', label: 'Bitcoin',  short: 'BTC', color: '#F97316', emoji: '₿' },
  { symbol: 'ETHUSDT', label: 'Ethereum', short: 'ETH', color: '#A78BFA', emoji: 'Ξ' },
  { symbol: 'BNBUSDT', label: 'BNB',      short: 'BNB', color: '#F59E0B', emoji: '◈' },
  { symbol: 'SOLUSDT', label: 'Solana',   short: 'SOL', color: '#14B8A6', emoji: '◎' },
  { symbol: 'XRPUSDT', label: 'XRP',      short: 'XRP', color: '#60A5FA', emoji: '✕' },
  { symbol: 'DOGEUSDT',label: 'Dogecoin', short: 'DOGE',color: '#FCD34D', emoji: 'Ð' },
];

const INTERVALS = [
  { value: '1m',  label: '1m' },
  { value: '5m',  label: '5m' },
  { value: '15m', label: '15m' },
  { value: '1h',  label: '1h' },
  { value: '4h',  label: '4h' },
  { value: '1d',  label: '1D' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────

function fmtUsd(n) {
  if (!n) return '—';
  if (n >= 1000) return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
}

function fmtBrl(usd, usdBrl) {
  if (!usd || !usdBrl) return null;
  const brl = usd * usdBrl;
  if (brl >= 1000) return `R$ ${brl.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `R$ ${brl.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`;
}

function fmtVolume(n) {
  if (!n) return '—';
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
  return n.toFixed(2);
}

// ─── Componente principal ─────────────────────────────────────────────────

export default function MercadoAoVivo() {
  const chartContainerRef = useRef(null);
  const chartRef          = useRef(null);
  const candleSeriesRef   = useRef(null);
  const volSeriesRef      = useRef(null);
  const unsubKlineRef     = useRef(null);
  const unsubTickerRef    = useRef(null);

  const [activeAsset,    setActiveAsset]    = useState(ASSETS[0]);
  const [activeInterval, setActiveInterval] = useState('15m');
  const [ticker,         setTicker]         = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [livePrice,      setLivePrice]      = useState(null);
  const [usdBrl,         setUsdBrl]         = useState(null);
  const [lastCandle,     setLastCandle]     = useState(null);

  // Pega USD/BRL do cache
  useEffect(() => {
    const cached = getCachedAssetPrices();
    if (cached?.usdBrl) setUsdBrl(cached.usdBrl);
  }, []);

  // ── Inicializa o chart ─────────────────────────────────────────────────
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#0f1117' },
        textColor:  '#9CA3AF',
        fontSize:   12,
      },
      grid: {
        vertLines: { color: '#1F2937' },
        horzLines: { color: '#1F2937' },
      },
      crosshair: {
        mode: 1,
        vertLine: { color: '#6B7280', style: 3 },
        horzLine: { color: '#6B7280', style: 3 },
      },
      rightPriceScale: { borderColor: '#374151' },
      timeScale: {
        borderColor:      '#374151',
        timeVisible:      true,
        secondsVisible:   false,
      },
      width:  chartContainerRef.current.clientWidth,
      height: 420,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor:        '#10B981',
      downColor:      '#EF4444',
      borderUpColor:  '#10B981',
      borderDownColor:'#EF4444',
      wickUpColor:    '#10B981',
      wickDownColor:  '#EF4444',
    });

    const volSeries = chart.addSeries(HistogramSeries, {
      color:       '#374151',
      priceFormat: { type: 'volume' },
      priceScaleId:'volume',
    });

    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    });

    chartRef.current         = chart;
    candleSeriesRef.current  = candleSeries;
    volSeriesRef.current     = volSeries;

    // Responsivo
    const ro = new ResizeObserver(() => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    });
    ro.observe(chartContainerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
    };
  }, []);

  // ── Carrega dados e conecta WebSocket ─────────────────────────────────
  const loadAsset = useCallback(async (asset, interval) => {
    if (!candleSeriesRef.current) return;

    // Desconecta WS anteriores
    unsubKlineRef.current?.();
    unsubTickerRef.current?.();

    setLoading(true);
    setError(null);
    setLivePrice(null);

    try {
      const [candles, tick] = await Promise.all([
        fetchCandles(asset.symbol, interval, 300),
        fetchTicker24h(asset.symbol),
      ]);

      candleSeriesRef.current.setData(candles);
      volSeriesRef.current.setData(
        candles.map(c => ({
          time:  c.time,
          value: c.volume,
          color: c.close >= c.open ? '#065F46' : '#7F1D1D',
        }))
      );

      chartRef.current.timeScale().fitContent();
      setTicker(tick);
      setLivePrice(tick.price);
      setLastCandle(candles[candles.length - 1]);
    } catch (e) {
      setError('Não foi possível carregar dados da Binance.');
    } finally {
      setLoading(false);
    }

    // WebSocket — candles ao vivo
    unsubKlineRef.current = subscribeKline(
      asset.symbol,
      interval,
      (candle) => {
        candleSeriesRef.current?.update({
          time:  candle.time,
          open:  candle.open,
          high:  candle.high,
          low:   candle.low,
          close: candle.close,
        });
        volSeriesRef.current?.update({
          time:  candle.time,
          value: candle.volume,
          color: candle.close >= candle.open ? '#065F46' : '#7F1D1D',
        });
        setLastCandle(candle);
      },
      () => {}
    );

    // WebSocket — preço instantâneo
    unsubTickerRef.current = subscribeTicker(asset.symbol, (tick) => {
      setLivePrice(tick.price);
    });
  }, []);

  useEffect(() => {
    loadAsset(activeAsset, activeInterval);
    return () => {
      unsubKlineRef.current?.();
      unsubTickerRef.current?.();
    };
  }, [activeAsset, activeInterval, loadAsset]);

  const change24h   = ticker?.change24h ?? 0;
  const isPositive  = change24h >= 0;
  const asset       = activeAsset;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white sm:text-3xl">
            Mercado ao Vivo
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gráficos em tempo real via Binance WebSocket · sem atraso · sem cadastro
          </p>
        </div>
        <span className="flex items-center gap-1.5 self-start rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600 dark:bg-green-900/30 dark:text-green-400 sm:self-auto">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
          Ao vivo · Binance
        </span>
      </div>

      {/* Seletor de ativo */}
      <div className="mb-4 flex flex-wrap gap-2">
        {ASSETS.map(a => (
          <button
            key={a.symbol}
            onClick={() => setActiveAsset(a)}
            className={`flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-semibold transition-all ${
              activeAsset.symbol === a.symbol
                ? 'border-transparent text-white shadow-lg'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300'
            }`}
            style={activeAsset.symbol === a.symbol ? { backgroundColor: a.color } : {}}
          >
            <span>{a.emoji}</span>
            {a.short}
          </button>
        ))}
      </div>

      {/* Painel principal */}
      <div className="overflow-hidden rounded-2xl border border-gray-800 bg-[#0f1117] shadow-2xl">

        {/* Barra de info do ativo */}
        <div className="flex flex-wrap items-center gap-4 border-b border-gray-800 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl" style={{ color: asset.color }}>{asset.emoji}</span>
            <div>
              <p className="text-xs text-gray-500">{asset.label}</p>
              <p className="text-xl font-bold text-white">
                {livePrice ? `$${fmtUsd(livePrice)}` : '…'}
                {usdBrl && livePrice && (
                  <span className="ml-2 text-sm font-normal text-gray-400">
                    {fmtBrl(livePrice, usdBrl)}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-bold ${
            isPositive ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'
          }`}>
            {isPositive ? '▲' : '▼'} {Math.abs(change24h).toFixed(2)}%
          </div>

          <div className="flex flex-wrap gap-6 text-xs text-gray-400">
            <div><span className="text-gray-600">Máx 24h</span><br /><span className="font-medium text-white">${fmtUsd(ticker?.high24h)}</span></div>
            <div><span className="text-gray-600">Mín 24h</span><br /><span className="font-medium text-white">${fmtUsd(ticker?.low24h)}</span></div>
            <div><span className="text-gray-600">Vol 24h</span><br /><span className="font-medium text-white">{fmtVolume(ticker?.volume24h)} {asset.short}</span></div>
            <div><span className="text-gray-600">Vol USD</span><br /><span className="font-medium text-white">${fmtVolume(ticker?.quoteVolume)}</span></div>
          </div>

          {/* Seletor de intervalo */}
          <div className="ml-auto flex gap-1">
            {INTERVALS.map(iv => (
              <button
                key={iv.value}
                onClick={() => setActiveInterval(iv.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeInterval === iv.value
                    ? 'bg-brand text-white'
                    : 'text-gray-500 hover:bg-gray-800 hover:text-gray-200'
                }`}
              >
                {iv.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gráfico */}
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0f1117]/80">
              <div className="flex items-center gap-3 text-gray-400">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-600 border-t-brand" />
                Carregando candles…
              </div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0f1117]/90">
              <div className="text-center text-red-400">
                <p className="mb-2 text-lg">⚠️</p>
                <p className="text-sm">{error}</p>
                <button
                  onClick={() => loadAsset(activeAsset, activeInterval)}
                  className="mt-3 rounded-lg bg-brand px-4 py-2 text-xs font-medium text-white"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          )}
          <div ref={chartContainerRef} className="w-full" />
        </div>

        {/* Rodapé do chart */}
        {lastCandle && (
          <div className="flex flex-wrap gap-4 border-t border-gray-800 px-5 py-3 text-xs text-gray-500">
            <span>O <span className="text-white">${fmtUsd(lastCandle.open)}</span></span>
            <span>H <span className="text-green-400">${fmtUsd(lastCandle.high)}</span></span>
            <span>L <span className="text-red-400">${fmtUsd(lastCandle.low)}</span></span>
            <span>C <span className="text-white">${fmtUsd(lastCandle.close)}</span></span>
            <span>Vol <span className="text-white">{fmtVolume(lastCandle.volume)}</span></span>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <p className="mt-4 text-center text-xs text-gray-400">
        Dados fornecidos pela Binance. Preços em USD · conversão BRL estimada via taxa de câmbio. Fins informativos — não constitui recomendação de investimento.
      </p>
    </main>
  );
}
