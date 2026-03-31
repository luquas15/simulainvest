/**
 * irpf.js — Cálculo do Imposto de Renda Pessoa Física
 * Tabela progressiva anual 2024 (declaração 2025)
 */

// Tabela progressiva anual
const FAIXAS = [
  { limite: 27110.40,  aliquota: 0,      deducao: 0        },
  { limite: 33919.80,  aliquota: 0.075,  deducao: 2033.28  },
  { limite: 45012.60,  aliquota: 0.15,   deducao: 4576.80  },
  { limite: 55976.16,  aliquota: 0.225,  deducao: 7753.17  },
  { limite: Infinity,  aliquota: 0.275,  deducao: 10551.98 },
];

export const DEDUCAO_DEPENDENTE  = 2275.08;   // por dependente
export const LIMITE_EDUCACAO     = 3561.50;   // por pessoa
export const LIMITE_SIMPLIFICADO = 16754.34;  // teto desconto simplificado

function calcIRSobreBase(base) {
  if (base <= 0) return 0;
  const faixa = FAIXAS.find(f => base <= f.limite);
  return Math.max(0, base * faixa.aliquota - faixa.deducao);
}

export function calcIRPFCompleto({ rendimento, inss, dependentes, saude, educacao }) {
  const dedDependentes = dependentes * DEDUCAO_DEPENDENTE;
  const dedEducacao    = Math.min(educacao, LIMITE_EDUCACAO * Math.max(1, dependentes + 1));
  const totalDeducoes  = inss + dedDependentes + saude + dedEducacao;
  const baseCalculo    = Math.max(0, rendimento - totalDeducoes);
  const irDevido       = calcIRSobreBase(baseCalculo);
  return {
    baseCalculo,
    totalDeducoes,
    irDevido,
    aliquotaEfetiva: rendimento > 0 ? irDevido / rendimento : 0,
  };
}

export function calcIRPFSimplificado({ rendimento, inss }) {
  const dedSimplificada = Math.min(rendimento * 0.20, LIMITE_SIMPLIFICADO);
  const totalDeducoes   = inss + dedSimplificada;
  const baseCalculo     = Math.max(0, rendimento - totalDeducoes);
  const irDevido        = calcIRSobreBase(baseCalculo);
  return {
    baseCalculo,
    totalDeducoes,
    dedSimplificada,
    irDevido,
    aliquotaEfetiva: rendimento > 0 ? irDevido / rendimento : 0,
  };
}

export function calcIRPF(params) {
  const completo     = calcIRPFCompleto(params);
  const simplificado = calcIRPFSimplificado(params);
  const melhor       = completo.irDevido <= simplificado.irDevido ? 'completo' : 'simplificado';
  return {
    completo,
    simplificado,
    melhor,
    economia: Math.abs(completo.irDevido - simplificado.irDevido),
  };
}
