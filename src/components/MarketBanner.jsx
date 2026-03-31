import { useMarketData } from '../context/MarketDataContext';

function Ticker({ label, value, suffix = '% a.a.', highlight = false }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 dark:text-gray-500">{label}</span>
      <span className={`text-sm font-bold tabular-nums ${highlight ? 'text-brand' : 'text-gray-900 dark:text-white'}`}>
        {value !== null && value !== undefined
          ? `${Number(value).toFixed(2)}${suffix}`
          : '—'}
      </span>
    </div>
  );
}

function Divider() {
  return <span className="hidden h-3 w-px bg-gray-200 dark:bg-gray-700 sm:block" />;
}

export default function MarketBanner() {
  const { rates, loading, refresh, lastUpdatedLabel, isLive } = useMarketData();

  return (
    <div className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/60">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-2 sm:px-6">
        {/* Taxas */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
          <Ticker label="Selic"   value={rates.selic}    highlight />
          <Divider />
          <Ticker label="CDI"     value={rates.cdi} />
          <Divider />
          <Ticker label="IPCA 12m" value={rates.ipca12m} />
          <Divider />
          <Ticker label="Poupança" value={rates.poupanca} />
        </div>

        {/* Status + refresh */}
        <div className="flex items-center gap-3">
          {/* Badge live / fallback */}
          <div className="flex items-center gap-1.5">
            {loading ? (
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="h-2.5 w-2.5 animate-spin rounded-full border border-gray-300 border-t-brand" />
                Atualizando…
              </span>
            ) : isLive ? (
              <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                Ao vivo · BCB {lastUpdatedLabel && `· ${lastUpdatedLabel}`}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-gray-400" title={rates.error ?? 'API indisponível — usando valores de referência'}>
                <span className="h-2 w-2 rounded-full bg-yellow-400" />
                Referência {lastUpdatedLabel && `· ${lastUpdatedLabel}`}
              </span>
            )}
          </div>

          {/* Botão de refresh */}
          <button
            onClick={refresh}
            disabled={loading}
            title="Atualizar taxas agora"
            aria-label="Atualizar taxas"
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-gray-400 transition-colors hover:bg-gray-100 hover:text-brand disabled:opacity-40 dark:hover:bg-gray-800"
          >
            <svg
              className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {!loading && 'Atualizar'}
          </button>
        </div>
      </div>

      {/* Aviso de data de referência */}
      {rates.referenceDate && isLive && (
        <div className="border-t border-gray-100 px-4 py-0.5 text-center dark:border-gray-800">
          <p className="text-xs text-gray-400">
            Dados do Banco Central do Brasil · Referência: {rates.referenceDate}
          </p>
        </div>
      )}
    </div>
  );
}
