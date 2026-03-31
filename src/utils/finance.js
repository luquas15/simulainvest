/**
 * finance.js — Lógica financeira central do SimulaInvest
 * Todos os cálculos são feitos client-side para performance imediata.
 */

/**
 * Converte taxa anual para mensal usando juros compostos.
 * @param {number} annualRate - Taxa anual em percentual (ex: 12 para 12%)
 * @returns {number} Taxa mensal em decimal
 */
export function annualToMonthlyRate(annualRate) {
  return Math.pow(1 + annualRate / 100, 1 / 12) - 1;
}

/**
 * Calcula a simulação de investimento mês a mês.
 * @param {Object} params
 * @param {number} params.initialValue     - Valor inicial investido
 * @param {number} params.monthlyContrib   - Aporte mensal
 * @param {number} params.rate             - Taxa de juros (decimal por período)
 * @param {number} params.periods          - Número de períodos (meses)
 * @param {number} params.inflationRate    - Inflação anual em % (0 = sem ajuste)
 * @returns {Array} Array de objetos com dados mensais
 */
export function simulateInvestment({ initialValue, monthlyContrib, rate, periods, inflationRate = 0 }) {
  const monthlyInflation = inflationRate > 0 ? annualToMonthlyRate(inflationRate) : 0;
  const data = [];

  let balance = initialValue;
  let totalInvested = initialValue;
  let totalInterest = 0;

  for (let month = 1; month <= periods; month++) {
    // Aplica juros ao saldo atual
    const monthInterest = balance * rate;
    balance += monthInterest;
    totalInterest += monthInterest;

    // Adiciona aporte mensal
    balance += monthlyContrib;
    totalInvested += monthlyContrib;

    // Valor real ajustado pela inflação
    const inflationFactor = monthlyInflation > 0
      ? Math.pow(1 + monthlyInflation, month)
      : 1;
    const realBalance = balance / inflationFactor;

    data.push({
      month,
      balance: round(balance),
      totalInvested: round(totalInvested),
      totalInterest: round(totalInterest),
      monthInterest: round(monthInterest),
      realBalance: round(realBalance),
    });
  }

  return data;
}

/**
 * Gera os 3 cenários de comparação.
 * @param {Object} baseParams - Parâmetros base do formulário
 * @returns {Object} Cenários conservador, moderado e agressivo
 */
export function generateScenarios(baseParams) {
  const scenarios = {
    conservative: {
      label: 'Conservador',
      description: 'CDB, Tesouro Direto, Poupança Plus',
      annualRate: 10,
      color: '#3B82F6',
    },
    moderate: {
      label: 'Moderado',
      description: 'Fundos Multimercado, LCI/LCA',
      annualRate: 14,
      color: '#8B5CF6',
    },
    aggressive: {
      label: 'Agressivo',
      description: 'Ações, FIIs, ETFs',
      annualRate: 20,
      color: '#00D46A',
    },
  };

  return Object.entries(scenarios).reduce((acc, [key, scenario]) => {
    const monthlyRate = annualToMonthlyRate(scenario.annualRate);
    const data = simulateInvestment({ ...baseParams, rate: monthlyRate });
    const last = data[data.length - 1];

    acc[key] = {
      ...scenario,
      data,
      finalBalance: last.balance,
      totalInvested: last.totalInvested,
      totalInterest: last.totalInterest,
    };
    return acc;
  }, {});
}

/**
 * Gera insights personalizados com base nos resultados.
 */
export function generateInsights({ initialValue, monthlyContrib, finalBalance, totalInvested, totalInterest, periods }) {
  const insights = [];
  const interestRatio = totalInterest / totalInvested;
  const years = Math.floor(periods / 12);
  const months = periods % 12;
  const timeLabel = years > 0
    ? `${years} ano${years > 1 ? 's' : ''}${months > 0 ? ` e ${months} mes${months > 1 ? 'es' : ''}` : ''}`
    : `${periods} meses`;

  insights.push({
    icon: '💰',
    text: `Em ${timeLabel}, você investiu ${formatCurrency(totalInvested)} e ganhou ${formatCurrency(totalInterest)} em juros — o dinheiro trabalhou ${formatPercent(interestRatio * 100)} a mais para você.`,
  });

  if (interestRatio > 1) {
    insights.push({
      icon: '🚀',
      text: `Os juros superaram o total investido! Isso é o poder dos juros compostos em ação.`,
    });
  }

  // Insight sobre aporte adicional
  const extraContrib = monthlyContrib * 0.1; // 10% a mais
  const newContrib = monthlyContrib + extraContrib;
  const monthlyRate = (finalBalance / initialValue) > 1
    ? Math.pow(finalBalance / initialValue, 1 / periods) - 1
    : 0.01;

  if (extraContrib > 0) {
    const newData = simulateInvestment({ initialValue, monthlyContrib: newContrib, rate: monthlyRate, periods });
    const newFinal = newData[newData.length - 1].finalBalance || newData[newData.length - 1].balance;
    const gain = newFinal - finalBalance;
    if (gain > 0) {
      insights.push({
        icon: '📈',
        text: `Se aumentar o aporte em ${formatCurrency(extraContrib)}/mês, você acumularia mais ${formatCurrency(gain)} ao final.`,
      });
    }
  }

  insights.push({
    icon: '⏰',
    text: `Começar cedo faz toda a diferença. Um ano a mais de investimento pode representar dezenas de milhares de reais extras.`,
  });

  return insights;
}

// ─── Helpers de formatação ───────────────────────────────────────────────────

export function round(value, decimals = 2) {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value, decimals = 2) {
  return `${value.toFixed(decimals)}%`;
}

export function formatLargeNumber(value) {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(1)}k`;
  return formatCurrency(value);
}
