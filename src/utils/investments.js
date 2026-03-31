/**
 * investments.js — Comparador de Investimentos com IR e taxas reais
 */

import { annualToMonthlyRate, round, formatCurrency } from './finance';

// Tabela regressiva de IR para renda fixa
const IR_TABLE = [
  { maxDays: 180,  rate: 0.225 },
  { maxDays: 360,  rate: 0.20 },
  { maxDays: 720,  rate: 0.175 },
  { maxDays: Infinity, rate: 0.15 },
];

export function getIRRate(days) {
  return IR_TABLE.find(t => days <= t.maxDays)?.rate ?? 0.15;
}

/**
 * Calcula o rendimento líquido de um investimento.
 * @param {number} principal     - Capital inicial
 * @param {number} annualRate    - Taxa bruta anual em %
 * @param {number} months        - Prazo em meses
 * @param {boolean} taxFree      - Se isento de IR (LCI, LCA, Poupança)
 * @param {number} adminFee      - Taxa de administração anual em % (fundos)
 * @param {boolean} irFlat       - Se usa IR flat 15% (cripto, ouro, câmbio)
 */
export function calcFixedIncome({ principal, annualRate, months, taxFree = false, adminFee = 0, irFlat = false }) {
  const effectiveRate = annualRate - adminFee;
  const monthlyRate = annualToMonthlyRate(effectiveRate);
  const grossFinal = principal * Math.pow(1 + monthlyRate, months);
  const grossProfit = grossFinal - principal;

  let netProfit = grossProfit;
  if (!taxFree) {
    const irRate = irFlat ? 0.15 : getIRRate(months * 30);
    netProfit = round(grossProfit * (1 - irRate));
  }

  return {
    grossFinal: round(grossFinal),
    grossProfit: round(grossProfit),
    netProfit: round(netProfit),
    netFinal: round(principal + netProfit),
    netAnnualRate: round(((Math.pow(1 + netProfit / principal, 12 / months) - 1) * 100), 4),
  };
}

/**
 * Tabela de produtos com parâmetros padrão (atualize conforme Selic).
 * CDI ≈ Selic ≈ 14.75% a.a. (referência de mar/2026 — ajuste conforme Copom)
 */
export function getInvestmentProducts(cdiRate = 14.75) {
  const selic = cdiRate;

  return [
    {
      id: 'poupanca',
      name: 'Poupança',
      category: 'Renda Fixa',
      risk: 'Baixíssimo',
      riskColor: '#3B82F6',
      annualRate: selic > 8.5 ? 0.5 * 12 + 0 : selic * 0.7, // regra real da poupança
      taxFree: true,
      adminFee: 0,
      liquidity: 'Mensal (aniversário)',
      guarantee: 'FGC até R$ 250k',
      description: 'Rendimento de 0,5%/mês + TR quando Selic > 8,5% a.a.',
      color: '#60A5FA',
    },
    {
      id: 'cdb-100',
      name: 'CDB 100% CDI',
      category: 'Renda Fixa',
      risk: 'Baixo',
      riskColor: '#3B82F6',
      annualRate: cdiRate * 1.0,
      taxFree: false,
      adminFee: 0,
      liquidity: 'No vencimento',
      guarantee: 'FGC até R$ 250k',
      description: 'CDB de banco médio/grande, 100% do CDI.',
      color: '#93C5FD',
    },
    {
      id: 'cdb-110',
      name: 'CDB 110% CDI',
      category: 'Renda Fixa',
      risk: 'Baixo',
      riskColor: '#3B82F6',
      annualRate: cdiRate * 1.1,
      taxFree: false,
      adminFee: 0,
      liquidity: 'No vencimento',
      guarantee: 'FGC até R$ 250k',
      description: 'CDB de banco digital, 110% do CDI.',
      color: '#6366F1',
    },
    {
      id: 'lci',
      name: 'LCI/LCA 92% CDI',
      category: 'Renda Fixa',
      risk: 'Baixo',
      riskColor: '#3B82F6',
      annualRate: cdiRate * 0.92,
      taxFree: true,
      adminFee: 0,
      liquidity: '90+ dias',
      guarantee: 'FGC até R$ 250k',
      description: 'Isento de IR. Equivale a um CDB de ~108% bruto.',
      color: '#A78BFA',
    },
    {
      id: 'tesouro-selic',
      name: 'Tesouro Selic',
      category: 'Renda Fixa',
      risk: 'Baixíssimo',
      riskColor: '#3B82F6',
      annualRate: selic - 0.1, // taxa de custódia B3 ≈ 0.10%
      taxFree: false,
      adminFee: 0,
      liquidity: 'D+1',
      guarantee: 'Governo Federal',
      description: 'Título público pós-fixado. Liquidez diária.',
      color: '#34D399',
    },
    {
      id: 'tesouro-ipca',
      name: 'Tesouro IPCA+ 6%',
      category: 'Renda Fixa',
      risk: 'Baixo',
      riskColor: '#3B82F6',
      annualRate: 4.5 + 6.0, // IPCA estimado + spread
      taxFree: false,
      adminFee: 0,
      liquidity: 'No vencimento (2035)',
      guarantee: 'Governo Federal',
      description: 'Protege da inflação + 6% de juro real.',
      color: '#10B981',
    },
    {
      id: 'fii',
      name: 'FIIs (média)',
      category: 'Renda Variável',
      risk: 'Moderado',
      riskColor: '#F59E0B',
      annualRate: 12,
      taxFree: true, // dividendos isentos para PF
      adminFee: 0,
      liquidity: 'D+2 (mercado)',
      guarantee: 'Nenhuma',
      description: 'Fundos Imobiliários. Dividendos isentos de IR.',
      color: '#FBBF24',
    },
    {
      id: 'acoes',
      name: 'Ações (Ibovespa)',
      category: 'Renda Variável',
      risk: 'Alto',
      riskColor: '#EF4444',
      annualRate: 15,
      taxFree: false,
      irFlat: false,
      adminFee: 0,
      liquidity: 'D+2 (mercado)',
      guarantee: 'Nenhuma',
      description: 'Média histórica do Ibovespa (sem garantias futuras).',
      color: '#F87171',
    },

    // ── Ativos Alternativos ───────────────────────────────────────────────────
    {
      id: 'sp500',
      name: 'S&P 500 (IVVB11)',
      category: 'Internacional',
      risk: 'Alto',
      riskColor: '#EF4444',
      annualRate: 20,
      taxFree: false,
      irFlat: false,
      adminFee: 0.23,
      liquidity: 'D+2 (mercado)',
      guarantee: 'Nenhuma',
      description: 'Média histórica em BRL incluindo variação cambial. Sem garantia futura.',
      color: '#818CF8',
    },
    {
      id: 'ouro',
      name: 'Ouro (GOLD11)',
      category: 'Ativos Reais',
      risk: 'Moderado',
      riskColor: '#F59E0B',
      annualRate: 14,
      taxFree: false,
      irFlat: true,
      adminFee: 0.3,
      liquidity: 'D+2 (mercado)',
      guarantee: 'Nenhuma',
      description: 'Média histórica em BRL (~12% a.a.). IR de 15% sobre ganho de capital.',
      color: '#F59E0B',
    },
    {
      id: 'dolar',
      name: 'Dólar (USD)',
      category: 'Internacional',
      risk: 'Moderado',
      riskColor: '#F59E0B',
      annualRate: 8,
      taxFree: false,
      irFlat: true,
      adminFee: 0,
      liquidity: 'Imediata',
      guarantee: 'Nenhuma',
      description: 'Valorização média histórica do USD frente ao BRL. IR 15% sobre ganho.',
      color: '#34D399',
    },
    {
      id: 'btc',
      name: 'Bitcoin (BTC)',
      category: 'Cripto',
      risk: 'Muito Alto',
      riskColor: '#DC2626',
      annualRate: 50,
      taxFree: false,
      irFlat: true,
      adminFee: 0,
      liquidity: 'Imediata',
      guarantee: 'Nenhuma',
      description: 'Média histórica anual em BRL (~50% a.a.). Volatilidade extrema. IR 15%.',
      color: '#F97316',
    },
    {
      id: 'eth',
      name: 'Ethereum (ETH)',
      category: 'Cripto',
      risk: 'Muito Alto',
      riskColor: '#DC2626',
      annualRate: 40,
      taxFree: false,
      irFlat: true,
      adminFee: 0,
      liquidity: 'Imediata',
      guarantee: 'Nenhuma',
      description: 'Média histórica anual em BRL (~40% a.a.). Volatilidade extrema. IR 15%.',
      color: '#A78BFA',
    },
  ];
}

/**
 * Gera comparativo completo entre todos os produtos.
 */
export function compareAllInvestments({ principal, months, cdiRate }) {
  const products = getInvestmentProducts(cdiRate);
  return products.map(p => ({
    ...p,
    ...calcFixedIncome({
      principal,
      annualRate: p.annualRate,
      months,
      taxFree: p.taxFree,
      adminFee: p.adminFee,
      irFlat: p.irFlat ?? false,
    }),
  })).sort((a, b) => b.netFinal - a.netFinal);
}
