import { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, CandlestickSeries, HistogramSeries } from 'lightweight-charts';
import { fetchCandles, fetchTicker24h, subscribeKline, subscribeTicker } from '../utils/binanceApi';
import { fetchBrapiQuotes, fetchBrapiChart, BR_INTERVAL_MAP } from '../utils/brapiApi';
import { getCachedAssetPrices } from '../utils/assetApi';
import AdUnit, { AD_SLOTS } from '../components/AdUnit';
import { usePageTitle } from '../hooks/usePageTitle';

// ─── Ativos ───────────────────────────────────────────────────────────────

const CRYPTO_ASSETS = [
  { symbol: 'BTCUSDT',  label: 'Bitcoin',    short: 'BTC',  color: '#F97316', emoji: '₿',  currency: 'USD' },
  { symbol: 'ETHUSDT',  label: 'Ethereum',   short: 'ETH',  color: '#A78BFA', emoji: 'Ξ',  currency: 'USD' },
  { symbol: 'BNBUSDT',  label: 'BNB',        short: 'BNB',  color: '#F59E0B', emoji: '◈',  currency: 'USD' },
  { symbol: 'SOLUSDT',  label: 'Solana',     short: 'SOL',  color: '#14B8A6', emoji: '◎',  currency: 'USD' },
  { symbol: 'XRPUSDT',  label: 'XRP',        short: 'XRP',  color: '#60A5FA', emoji: '✕',  currency: 'USD' },
  { symbol: 'DOGEUSDT', label: 'Dogecoin',   short: 'DOGE', color: '#FCD34D', emoji: 'Ð',  currency: 'USD' },
];

const BR_ASSETS = [
  { symbol: 'PETR4',  label: 'Petrobras',      short: 'PETR4',  color: '#10B981', emoji: '🛢', currency: 'BRL' },
  { symbol: 'VALE3',  label: 'Vale',            short: 'VALE3',  color: '#3B82F6', emoji: '⛏', currency: 'BRL' },
  { symbol: 'ITUB4',  label: 'Itaú',            short: 'ITUB4',  color: '#F97316', emoji: '🏦', currency: 'BRL' },
  { symbol: 'BBDC4',  label: 'Bradesco',        short: 'BBDC4',  color: '#EF4444', emoji: '🏛', currency: 'BRL' },
  { symbol: 'ABEV3',  label: 'Ambev',           short: 'ABEV3',  color: '#FBBF24', emoji: '🍺', currency: 'BRL' },
  { symbol: 'WEGE3',  label: 'WEG',             short: 'WEGE3',  color: '#06B6D4', emoji: '⚙', currency: 'BRL' },
  { symbol: 'MGLU3',  label: 'Magazine Luiza',  short: 'MGLU3',  color: '#8B5CF6', emoji: '🛍', currency: 'BRL' },
  { symbol: 'BOVA11', label: 'Ibovespa ETF',    short: 'BOVA11', color: '#34D399', emoji: '📈', currency: 'BRL' },
  { symbol: 'IVVB11', label: 'S&P 500 ETF',     short: 'IVVB11', color: '#818CF8', emoji: '🇺🇸', currency: 'BRL' },
  { symbol: 'KNRI11', label: 'Kinea FII',       short: 'KNRI11', color: '#F472B6', emoji: '🏢', currency: 'BRL' },
];

const CRYPTO_INTERVALS = [
  { value: '1m', label: '1m' }, { value: '5m', label: '5m' },
  { value: '15m', label: '15m' }, { value: '1h', label: '1h' },
  { value: '4h', label: '4h' }, { value: '1d', label: '1D' },
];

const BR_INTERVALS = [
  { value: '5m', label: '5m' }, { value: '15m', label: '15m' },
  { value: '30m', label: '30m' }, { value: '1h', label: '1h' },
  { value: '1d', label: '1D' }, { value: '1wk', label: '1S' },
];

// ─── Formatadores ─────────────────────────────────────────────────────────

const fmtPrice = (n, currency = 'USD') => {
  if (!n && n !== 0) return '—';
  if (currency === 'BRL') return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (n >= 1000) return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
};

const fmtVol = (n) => {
  if (!n) return '—';
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toFixed(0);
};

const currSymbol = (c) => c === 'BRL' ? 'R$' : '$';

// ─── Sub-componentes ──────────────────────────────────────────────────────

function ChangePill({ value, size = 'sm' }) {
  if (value == null) return null;
  const pos = value >= 0;
  const text = size === 'lg' ? 'text-base' : 'text-xs';
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 font-semibold ${text} ${
      pos ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
    }`}>
      {pos ? '▲' : '▼'} {Math.abs(value).toFixed(2)}%
    </span>
  );
}

function WatchlistItem({ asset, price, changePct, isActive, onClick, currency }) {
  const pos = (changePct ?? 0) >= 0;
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center justify-between px-3 py-2.5 transition-all ${
        isActive
          ? 'bg-white/5 border-l-2 pl-2.5'
          : 'border-l-2 border-transparent hover:bg-white/3 pl-2.5'
      }`}
      style={isActive ? { borderLeftColor: asset.color } : {}}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="text-lg flex-shrink-0">{asset.emoji}</span>
        <div className="min-w-0">
          <p className={`text-xs font-bold leading-tight truncate ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
            {asset.short}
          </p>
          <p className="text-[10px] text-gray-600 truncate">{asset.label}</p>
        </div>
      </div>
      <div className="text-right flex-shrink-0 ml-2">
        <p className="text-xs font-semibold text-gray-200">
          {price ? `${currSymbol(currency)} ${fmtPrice(price, currency)}` : '—'}
        </p>
        <p className={`text-[10px] font-medium ${pos ? 'text-emerald-400' : 'text-red-400'}`}>
          {changePct != null ? `${pos ? '+' : ''}${changePct.toFixed(2)}%` : '—'}
        </p>
      </div>
    </button>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl bg-white/3 px-4 py-3">
      <span className="text-[10px] uppercase tracking-widest text-gray-600">{label}</span>
      <span className={`text-sm font-bold ${color ?? 'text-gray-200'}`}>{value}</span>
      {sub && <span className="text-[10px] text-gray-600">{sub}</span>}
    </div>
  );
}

// ─── Hook do gráfico ──────────────────────────────────────────────────────

function useChart(containerRef) {
  const chartRef   = useRef(null);
  const candleRef  = useRef(null);
  const volRef     = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      layout: { background: { color: '#0B0E17' }, textColor: '#6B7280', fontSize: 11 },
      grid:   { vertLines: { color: '#161B28' }, horzLines: { color: '#161B28' } },
      crosshair: {
        vertLine: { color: '#374151', style: 3, labelBackgroundColor: '#1F2937' },
        horzLine: { color: '#374151', style: 3, labelBackgroundColor: '#1F2937' },
      },
      rightPriceScale: { borderColor: '#1E2433' },
      timeScale: { borderColor: '#1E2433', timeVisible: true, secondsVisible: false },
      width:  containerRef.current.clientWidth,
      height: 380,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#00D97E', downColor: '#FF4560',
      borderUpColor: '#00D97E', borderDownColor: '#FF4560',
      wickUpColor: '#00D97E', wickDownColor: '#FF4560',
    });
    candleSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.05, bottom: 0.22 },
    });

    const volSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'vol',
    });
    chart.priceScale('vol').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
      visible: false,
    });

    chartRef.current  = chart;
    candleRef.current = candleSeries;
    volRef.current    = volSeries;

    const ro = new ResizeObserver(() => {
      if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth });
    });
    ro.observe(containerRef.current);

    return () => { ro.disconnect(); chart.remove(); };
  }, [containerRef]);

  const setData = useCallback((candles) => {
    if (!candleRef.current || !volRef.current || !candles.length) return;
    candleRef.current.setData(candles);
    volRef.current.setData(candles.map(c => ({
      time: c.time, value: c.volume,
      color: c.close >= c.open ? '#00D97E55' : '#FF456055',
    })));
    chartRef.current?.timeScale().fitContent();
  }, []);

  const updateCandle = useCallback((candle) => {
    candleRef.current?.update(candle);
    volRef.current?.update({
      time: candle.time, value: candle.volume,
      color: candle.close >= candle.open ? '#00D97E55' : '#FF456055',
    });
  }, []);

  return { setData, updateCandle };
}

// ─── Componente principal ─────────────────────────────────────────────────

export default function MercadoAoVivo() {
  const chartContainerRef = useRef(null);
  const { setData, updateCandle } = useChart(chartContainerRef);

  const [market,       setMarket]       = useState('crypto');   // 'crypto' | 'br'
  const [activeAsset,  setActiveAsset]  = useState(CRYPTO_ASSETS[0]);
  const [interval,     setInterval]     = useState('15m');
  const [ticker,       setTicker]       = useState(null);
  const [livePrice,    setLivePrice]    = useState(null);
  const [lastCandle,   setLastCandle]   = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [usdBrl,       setUsdBrl]       = useState(null);
  const [watchPrices,  setWatchPrices]  = useState({});   // { symbol: { price, changePct } }

  usePageTitle('Mercado ao Vivo — Cripto e B3');

  const unsubKline  = useRef(null);
  const unsubTicker = useRef(null);
  const brRefresh   = useRef(null);

  // USD/BRL do cache
  useEffect(() => {
    const c = getCachedAssetPrices();
    if (c?.usdBrl) setUsdBrl(c.usdBrl);
  }, []);

  // ── Troca de mercado ───────────────────────────────────────────────────
  const switchMarket = (m) => {
    setMarket(m);
    const first = m === 'crypto' ? CRYPTO_ASSETS[0] : BR_ASSETS[0];
    setActiveAsset(first);
    setInterval(m === 'crypto' ? '15m' : '1d');
    setWatchPrices({});
    setTicker(null);
    setLivePrice(null);
  };

  // ── Carrega gráfico cripto ─────────────────────────────────────────────
  const loadCrypto = useCallback(async (asset, iv) => {
    unsubKline.current?.();
    unsubTicker.current?.();
    clearInterval(brRefresh.current);
    setLoading(true); setError(null);

    try {
      const [candles, tick] = await Promise.all([
        fetchCandles(asset.symbol, iv, 300),
        fetchTicker24h(asset.symbol),
      ]);
      setData(candles);
      setTicker(tick);
      setLivePrice(tick.price);
      setLastCandle(candles[candles.length - 1]);
    } catch { setError('Erro ao carregar Binance.'); }
    finally { setLoading(false); }

    unsubKline.current = subscribeKline(asset.symbol, iv, (c) => {
      updateCandle(c);
      setLastCandle(c);
    }, () => {});

    unsubTicker.current = subscribeTicker(asset.symbol, (t) => {
      setLivePrice(t.price);
      setTicker(prev => prev ? { ...prev, price: t.price } : prev);
    });
  }, [setData, updateCandle]);

  // Watchlist cripto (multi-stream)
  useEffect(() => {
    if (market !== 'crypto') return;
    const streams = CRYPTO_ASSETS.map(a => `${a.symbol.toLowerCase()}@miniTicker`).join('/');
    const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
    ws.onmessage = (e) => {
      try {
        const { data: d } = JSON.parse(e.data);
        const sym = d.s;
        const price = parseFloat(d.c);
        const open  = parseFloat(d.o);
        const changePct = open > 0 ? ((price - open) / open) * 100 : 0;
        setWatchPrices(prev => ({ ...prev, [sym]: { price, changePct } }));
      } catch {}
    };
    return () => ws.close();
  }, [market]);

  // ── Carrega gráfico B3 ─────────────────────────────────────────────────
  const loadBR = useCallback(async (asset, iv) => {
    unsubKline.current?.();
    unsubTicker.current?.();
    clearInterval(brRefresh.current);
    setLoading(true); setError(null);

    const doLoad = async () => {
      try {
        const { candles, ticker: tick } = await fetchBrapiChart(asset.symbol, iv);
        setData(candles);
        setTicker({ price: tick.price, change24h: tick.changePct, high24h: tick.high24h, low24h: tick.low24h, volume24h: tick.volume });
        setLivePrice(tick.price);
        setLastCandle(candles[candles.length - 1]);
      } catch { setError('Erro ao carregar B3. Tente novamente.'); }
      finally { setLoading(false); }
    };

    await doLoad();
    // Refresca a cada 30s (B3 não tem WebSocket gratuito)
    brRefresh.current = setInterval(doLoad, 30000);
  }, [setData]);

  // Watchlist B3
  useEffect(() => {
    if (market !== 'br') return;
    const loadWatch = async () => {
      try {
        const results = await fetchBrapiQuotes(BR_ASSETS.map(a => a.symbol));
        const map = {};
        results.forEach(r => {
          map[r.symbol] = { price: r.regularMarketPrice, changePct: r.regularMarketChangePercent };
        });
        setWatchPrices(map);
      } catch {}
    };
    loadWatch();
    const id = setInterval(loadWatch, 30000);
    return () => clearInterval(id);
  }, [market]);

  // ── Troca de ativo/intervalo ───────────────────────────────────────────
  useEffect(() => {
    if (market === 'crypto') loadCrypto(activeAsset, interval);
    else loadBR(activeAsset, interval);
    return () => {
      unsubKline.current?.();
      unsubTicker.current?.();
      clearInterval(brRefresh.current);
    };
  }, [activeAsset, interval, market, loadCrypto, loadBR]);

  const assets    = market === 'crypto' ? CRYPTO_ASSETS : BR_ASSETS;
  const intervals = market === 'crypto' ? CRYPTO_INTERVALS : BR_INTERVALS;
  const pos       = (ticker?.change24h ?? 0) >= 0;
  const cur       = activeAsset.currency;

  const brlPrice  = cur === 'USD' && usdBrl && livePrice
    ? `≈ R$ ${fmtPrice(livePrice * usdBrl, 'BRL')}`
    : null;

  return (
    <div className="min-h-screen bg-[#0B0E17]">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">

        {/* ── Cabeçalho ─────────────────────────────────────────────────── */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-white sm:text-3xl">Mercado ao Vivo</h1>
            <p className="text-xs text-gray-600">
              {market === 'crypto' ? 'Binance WebSocket · atualização instantânea' : 'brapi.dev · atualização a cada 30s'}
            </p>
          </div>

          {/* Market tabs */}
          <div className="flex rounded-xl border border-[#1E2433] bg-[#141821] p-1">
            <button
              onClick={() => switchMarket('crypto')}
              className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition-all ${
                market === 'crypto'
                  ? 'bg-brand text-white shadow-lg'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              ₿ Criptomoedas
            </button>
            <button
              onClick={() => switchMarket('br')}
              className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition-all ${
                market === 'br'
                  ? 'bg-brand text-white shadow-lg'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              🇧🇷 Brasil B3
            </button>
          </div>

          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            {market === 'crypto' ? 'Ao vivo' : 'Atualiza em 30s'}
          </span>
        </div>

        {/* ── Layout principal ───────────────────────────────────────────── */}
        <div className="flex gap-3">

          {/* Watchlist */}
          <aside className="hidden w-52 flex-shrink-0 xl:flex flex-col rounded-2xl border border-[#1E2433] bg-[#141821] overflow-hidden">
            <div className="border-b border-[#1E2433] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-600">
                {market === 'crypto' ? 'Cripto' : 'Ações B3'}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto py-1">
              {assets.map(a => (
                <WatchlistItem
                  key={a.symbol}
                  asset={a}
                  price={watchPrices[a.symbol]?.price ?? (a.symbol === activeAsset.symbol ? livePrice : null)}
                  changePct={watchPrices[a.symbol]?.changePct ?? (a.symbol === activeAsset.symbol ? ticker?.change24h : null)}
                  isActive={activeAsset.symbol === a.symbol}
                  onClick={() => setActiveAsset(a)}
                  currency={a.currency}
                />
              ))}
            </div>
          </aside>

          {/* Área do gráfico */}
          <div className="flex-1 min-w-0 flex flex-col gap-3">

            {/* Header do ativo */}
            <div className="rounded-2xl border border-[#1E2433] bg-[#141821] px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-4">

                {/* Nome + preço */}
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
                    style={{ background: `${activeAsset.color}18` }}>
                    {activeAsset.emoji}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-white">{activeAsset.short}</span>
                      <span className="text-xs text-gray-600">{activeAsset.label}</span>
                      {market === 'br' && <span className="rounded-full bg-[#1E2433] px-2 py-0.5 text-[10px] font-semibold text-gray-500">B3</span>}
                    </div>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-2xl font-black text-white tabular-nums">
                        {livePrice ? `${currSymbol(cur)} ${fmtPrice(livePrice, cur)}` : '—'}
                      </span>
                      {brlPrice && <span className="text-sm text-gray-600">{brlPrice}</span>}
                      <ChangePill value={ticker?.change24h} size="lg" />
                    </div>
                  </div>
                </div>

                {/* Intervalos */}
                <div className="flex items-center gap-1 rounded-xl border border-[#1E2433] bg-[#0B0E17] p-1">
                  {intervals.map(iv => (
                    <button key={iv.value} onClick={() => setInterval(iv.value)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        interval === iv.value
                          ? 'bg-brand text-white shadow'
                          : 'text-gray-600 hover:text-gray-300'
                      }`}>
                      {iv.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <StatCard label="Máx 24h" value={ticker?.high24h ? `${currSymbol(cur)} ${fmtPrice(ticker.high24h, cur)}` : '—'} color="text-emerald-400" />
                <StatCard label="Mín 24h" value={ticker?.low24h ? `${currSymbol(cur)} ${fmtPrice(ticker.low24h, cur)}` : '—'} color="text-red-400" />
                <StatCard label="Volume" value={fmtVol(ticker?.volume24h)} sub={activeAsset.short} />
                <StatCard
                  label={cur === 'USD' ? 'Vol USD' : 'Var. 24h'}
                  value={cur === 'USD' && ticker?.quoteVolume ? `$${fmtVol(ticker.quoteVolume)}` : (ticker?.change24h != null ? `${ticker.change24h >= 0 ? '+' : ''}${ticker.change24h.toFixed(2)}%` : '—')}
                  color={ticker?.change24h != null ? (ticker.change24h >= 0 ? 'text-emerald-400' : 'text-red-400') : undefined}
                />
              </div>
            </div>

            {/* Gráfico */}
            <div className="relative overflow-hidden rounded-2xl border border-[#1E2433] bg-[#0B0E17]">
              {loading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0B0E17]/90">
                  <div className="flex flex-col items-center gap-3 text-gray-600">
                    <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#1E2433] border-t-brand" />
                    <span className="text-xs">Carregando candles…</span>
                  </div>
                </div>
              )}
              {error && !loading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0B0E17]/95">
                  <div className="text-center">
                    <p className="text-2xl mb-2">⚠️</p>
                    <p className="text-sm text-red-400 mb-3">{error}</p>
                    <button onClick={() => market === 'crypto' ? loadCrypto(activeAsset, interval) : loadBR(activeAsset, interval)}
                      className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">
                      Tentar novamente
                    </button>
                  </div>
                </div>
              )}
              <div ref={chartContainerRef} className="w-full" />

              {/* OHLCV do último candle */}
              {lastCandle && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-[#1E2433] px-5 py-2.5 text-xs">
                  {[
                    { l: 'O', v: fmtPrice(lastCandle.open, cur),  c: 'text-gray-400' },
                    { l: 'H', v: fmtPrice(lastCandle.high, cur),  c: 'text-emerald-400' },
                    { l: 'L', v: fmtPrice(lastCandle.low, cur),   c: 'text-red-400' },
                    { l: 'C', v: fmtPrice(lastCandle.close, cur), c: 'text-white' },
                    { l: 'Vol', v: fmtVol(lastCandle.volume),     c: 'text-gray-400' },
                  ].map(({ l, v, c }) => (
                    <span key={l} className="text-gray-600">
                      {l} <span className={`font-semibold ${c}`}>{v}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Watchlist mobile */}
            <div className="xl:hidden flex gap-2 overflow-x-auto pb-1">
              {assets.map(a => {
                const wp = watchPrices[a.symbol];
                const isActive = a.symbol === activeAsset.symbol;
                const p = wp?.price ?? (isActive ? livePrice : null);
                const ch = wp?.changePct ?? (isActive ? ticker?.change24h : null);
                const pos2 = (ch ?? 0) >= 0;
                return (
                  <button key={a.symbol} onClick={() => setActiveAsset(a)}
                    className={`flex-shrink-0 flex flex-col items-start rounded-xl border px-3 py-2 transition-all ${
                      isActive ? 'border-opacity-50 bg-white/5' : 'border-[#1E2433] bg-[#141821] hover:border-gray-700'
                    }`}
                    style={isActive ? { borderColor: a.color } : {}}>
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="text-sm">{a.emoji}</span>
                      <span className="text-xs font-bold text-white">{a.short}</span>
                    </div>
                    <p className="text-xs text-gray-400">{p ? `${currSymbol(a.currency)} ${fmtPrice(p, a.currency)}` : '—'}</p>
                    <p className={`text-[10px] font-semibold ${pos2 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {ch != null ? `${pos2 ? '+' : ''}${ch.toFixed(2)}%` : '—'}
                    </p>
                  </button>
                );
              })}
            </div>

          </div>
        </div>

        <AdUnit slot={AD_SLOTS.HORIZONTAL} className="mt-5 rounded-2xl bg-[#141821]" />

        {/* Disclaimer */}
        <p className="mt-5 text-center text-xs text-gray-700">
          {market === 'crypto'
            ? 'Dados via Binance · preços em USD · conversão BRL estimada · fins informativos'
            : 'Dados via brapi.dev (B3) · preços em BRL · pode haver atraso · fins informativos — não constitui recomendação de investimento'}
        </p>
      </div>
    </div>
  );
}
