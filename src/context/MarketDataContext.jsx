import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  fetchMarketRates,
  getCachedRates,
  setCachedRates,
  clearRatesCache,
} from '../utils/marketApi';

const MarketDataContext = createContext(null);

// Valores padrão enquanto carrega (mar/2026)
const INITIAL = {
  selic:         14.75,
  cdi:           14.65,
  ipca12m:       5.48,
  poupanca:      6.17,
  referenceDate: null,
  source:        'initial',
  fetchedAt:     null,
  error:         null,
};

export function MarketDataProvider({ children }) {
  const [rates,   setRates]   = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const hasFetched = useRef(false);

  const load = useCallback(async (forceRefresh = false) => {
    // Tenta cache primeiro (exceto em refresh forçado)
    if (!forceRefresh) {
      const cached = getCachedRates();
      if (cached) {
        setRates(cached);
        hasFetched.current = true;
        return;
      }
    } else {
      clearRatesCache();
    }

    setLoading(true);
    try {
      const fresh = await fetchMarketRates();
      setCachedRates(fresh);
      setRates(fresh);
    } catch (err) {
      console.warn('[MarketDataContext] fetch error:', err);
    } finally {
      setLoading(false);
      hasFetched.current = true;
    }
  }, []);

  // Busca ao montar — apenas uma vez
  useEffect(() => {
    if (!hasFetched.current) load();
  }, [load]);

  const refresh = useCallback(() => load(true), [load]);

  // Tempo desde a última atualização
  const lastUpdatedLabel = (() => {
    if (!rates.fetchedAt) return null;
    const diffMin = Math.floor((Date.now() - rates.fetchedAt) / 60000);
    if (diffMin < 1)  return 'agora mesmo';
    if (diffMin < 60) return `${diffMin} min atrás`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24)   return `${diffH}h atrás`;
    return `${Math.floor(diffH / 24)}d atrás`;
  })();

  return (
    <MarketDataContext.Provider value={{
      rates,
      loading,
      refresh,
      lastUpdatedLabel,
      isLive: rates.source === 'bcb',
    }}>
      {children}
    </MarketDataContext.Provider>
  );
}

export function useMarketData() {
  const ctx = useContext(MarketDataContext);
  if (!ctx) throw new Error('useMarketData deve ser usado dentro de MarketDataProvider');
  return ctx;
}
