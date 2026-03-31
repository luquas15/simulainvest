import { createContext, useContext, useMemo, useState } from 'react';
import { annualToMonthlyRate, simulateInvestment, generateScenarios, generateInsights } from '../utils/finance';

const SimulatorContext = createContext(null);

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

export function SimulatorProvider({ children }) {
  const [params, setParams] = useState(DEFAULT_PARAMS);

  const updateParam = (key, value) =>
    setParams(prev => ({ ...prev, [key]: value }));

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

  return (
    <SimulatorContext.Provider value={{
      params,
      updateParam,
      normalized,
      timelineData,
      scenarios,
      summary,
      insights,
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
