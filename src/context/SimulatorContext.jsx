import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { annualToMonthlyRate, simulateInvestment, generateScenarios, generateInsights } from '../utils/finance';

const SimulatorContext = createContext(null);

const HISTORY_KEY = 'simulainvest-sim-history';

// Valores padrão para o formulário
const DEFAULT_PARAMS = {
  initialValue: 1000,
  monthlyContrib: 200,
  annualRate: 12,
  rateType: 'annual',   // 'annual' | 'monthly'
  periods: 24,
  periodType: 'months', // 'months' | 'years'
  inflationRate: 4.5,
  includeInflation: false,
};

// Lê parâmetros da URL (mesmo formato do ShareButton)
function readParamsFromUrl() {
  try {
    const sp = new URLSearchParams(window.location.search);
    const overrides = {};
    if (sp.has('vi'))  overrides.initialValue    = Number(sp.get('vi'));
    if (sp.has('mc'))  overrides.monthlyContrib  = Number(sp.get('mc'));
    if (sp.has('rate'))overrides.annualRate       = Number(sp.get('rate'));
    if (sp.has('rt'))  overrides.rateType         = sp.get('rt');
    if (sp.has('per')) overrides.periods          = Number(sp.get('per'));
    if (sp.has('pt'))  overrides.periodType       = sp.get('pt');
    if (sp.has('inf')) overrides.inflationRate    = Number(sp.get('inf'));
    if (sp.has('ii'))  overrides.includeInflation = sp.get('ii') === '1';
    return Object.keys(overrides).length ? { ...DEFAULT_PARAMS, ...overrides } : null;
  } catch { return null; }
}

export function SimulatorProvider({ children }) {
  const [params, setParams] = useState(() => readParamsFromUrl() ?? DEFAULT_PARAMS);

  const updateParam = (key, value) =>
    setParams(prev => ({ ...prev, [key]: value }));

  // Sincroniza URL com os parâmetros atuais (sem criar entrada no histórico)
  useEffect(() => {
    const sp = new URLSearchParams({
      vi:   params.initialValue,
      mc:   params.monthlyContrib,
      rate: params.annualRate,
      rt:   params.rateType,
      per:  params.periods,
      pt:   params.periodType,
      inf:  params.inflationRate,
      ii:   params.includeInflation ? '1' : '0',
    });
    window.history.replaceState(null, '', `${window.location.pathname}?${sp.toString()}`);
  }, [params]);

  // Normaliza parâmetros para o cálculo
  const normalized = useMemo(() => {
    const periods = params.periodType === 'years'
      ? params.periods * 12
      : params.periods;

    const rate = params.rateType === 'annual'
      ? annualToMonthlyRate(params.annualRate)
      : params.annualRate / 100;

    return {
      initialValue: params.initialValue,
      monthlyContrib: params.monthlyContrib,
      rate,
      periods,
      inflationRate: params.includeInflation ? params.inflationRate : 0,
    };
  }, [params]);

  // Dados mensais da simulação principal
  const timelineData = useMemo(
    () => simulateInvestment(normalized),
    [normalized]
  );

  // Cenários comparativos
  const scenarios = useMemo(
    () => generateScenarios({
      initialValue: normalized.initialValue,
      monthlyContrib: normalized.monthlyContrib,
      periods: normalized.periods,
      inflationRate: normalized.inflationRate,
    }),
    [normalized.initialValue, normalized.monthlyContrib, normalized.periods, normalized.inflationRate]
  );

  // Resumo final
  const summary = useMemo(() => {
    if (!timelineData.length) return null;
    const last = timelineData[timelineData.length - 1];
    return {
      finalBalance: last.balance,
      totalInvested: last.totalInvested,
      totalInterest: last.totalInterest,
      realBalance: last.realBalance,
    };
  }, [timelineData]);

  // Insights automáticos
  const insights = useMemo(() => {
    if (!summary) return [];
    return generateInsights({
      ...normalized,
      ...summary,
    });
  }, [normalized, summary]);

  // Histórico: salva as últimas 5 simulações no localStorage
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) ?? []; }
    catch { return []; }
  });

  useEffect(() => {
    if (!summary) return;
    const entry = {
      id: Date.now(),
      label: `R$ ${params.initialValue.toLocaleString('pt-BR')} · ${params.annualRate}% a.a. · ${params.periods} ${params.periodType}`,
      finalBalance: summary.finalBalance,
      params: { ...params },
      savedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    setHistory(prev => {
      const next = [entry, ...prev.filter(h => h.id !== entry.id)].slice(0, 5);
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary?.finalBalance, params.initialValue, params.annualRate, params.periods]);

  function copyShareUrl() {
    return navigator.clipboard.writeText(window.location.href);
  }

  return (
    <SimulatorContext.Provider value={{
      params,
      updateParam,
      normalized,
      timelineData,
      scenarios,
      summary,
      insights,
      copyShareUrl,
      history,
    }}>
      {children}
    </SimulatorContext.Provider>
  );
}

export function useSimulator() {
  const ctx = useContext(SimulatorContext);
  if (!ctx) throw new Error('useSimulator deve ser usado dentro de SimulatorProvider');
  return ctx;
}
