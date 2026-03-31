/**
 * goals.js — Calculadora de Metas e Simulador de Aposentadoria
 */

import { annualToMonthlyRate, formatCurrency, round } from './finance';

/**
 * Calcula o aporte mensal necessário para atingir uma meta.
 * Fórmula: PMT = (FV - PV*(1+i)^n) * i / ((1+i)^n - 1)
 *
 * @param {number} goalValue      - Valor da meta (FV)
 * @param {number} initialValue   - Valor já investido (PV)
 * @param {number} monthlyRate    - Taxa mensal em decimal
 * @param {number} periods        - Períodos em meses
 * @returns {number} Aporte mensal necessário
 */
export function calcRequiredContrib({ goalValue, initialValue, monthlyRate, periods }) {
  if (monthlyRate === 0) {
    return round(Math.max(0, (goalValue - initialValue) / periods));
  }
  const growth = Math.pow(1 + monthlyRate, periods);
  const pv = initialValue * growth;
  const required = ((goalValue - pv) * monthlyRate) / (growth - 1);
  return round(Math.max(0, required));
}

/**
 * Calcula em quantos meses o usuário atingirá a meta dado um aporte fixo.
 * Usa busca binária (máx 1200 meses = 100 anos).
 */
export function calcMonthsToGoal({ goalValue, initialValue, monthlyContrib, monthlyRate }) {
  if (initialValue >= goalValue) return 0;

  let balance = initialValue;
  for (let m = 1; m <= 1200; m++) {
    balance = balance * (1 + monthlyRate) + monthlyContrib;
    if (balance >= goalValue) return m;
  }
  return null; // impossível com esses parâmetros
}

/**
 * Gera a timeline de progresso em direção à meta (mensal).
 */
export function simulateGoalProgress({ goalValue, initialValue, monthlyContrib, monthlyRate, periods }) {
  const data = [];
  let balance = initialValue;
  let totalInvested = initialValue;

  for (let m = 1; m <= periods; m++) {
    const interest = balance * monthlyRate;
    balance = balance + interest + monthlyContrib;
    totalInvested += monthlyContrib;

    data.push({
      month: m,
      balance: round(balance),
      totalInvested: round(totalInvested),
      goalPercent: round(Math.min((balance / goalValue) * 100, 100)),
      reached: balance >= goalValue,
    });

    if (balance >= goalValue) break;
  }

  return data;
}

// ─── Aposentadoria ──────────────────────────────────────────────────────────

/**
 * Calcula o capital necessário para gerar uma renda perpétua (ou por N anos).
 * Fórmula para renda por N anos: PV = PMT * (1 - (1+i)^-n) / i
 * Para perpetuidade: PV = PMT / i
 *
 * @param {number} monthlyIncome    - Renda mensal desejada na aposentadoria
 * @param {number} monthlyRate      - Taxa de retorno mensal na aposentadoria
 * @param {number} retirementYears  - Anos de aposentadoria (0 = perpetuidade)
 * @returns {number} Capital necessário
 */
export function calcRetirementCapital({ monthlyIncome, monthlyRate, retirementYears = 0 }) {
  if (monthlyRate <= 0) return monthlyIncome * (retirementYears > 0 ? retirementYears * 12 : 300);
  if (retirementYears === 0) return round(monthlyIncome / monthlyRate); // perpetuidade
  const n = retirementYears * 12;
  return round(monthlyIncome * (1 - Math.pow(1 + monthlyRate, -n)) / monthlyRate);
}

/**
 * Simulação completa de aposentadoria:
 * Fase 1 — acumulação (até a aposentadoria)
 * Fase 2 — retirada (durante a aposentadoria)
 */
export function simulateRetirement({
  currentAge,
  retirementAge,
  lifeExpectancy,
  currentSavings,
  monthlyContrib,
  monthlyRate,
  retirementIncome,
  retirementRate, // taxa na fase de retirada (geralmente mais conservadora)
}) {
  const accumulationMonths = (retirementAge - currentAge) * 12;
  const withdrawalMonths   = (lifeExpectancy - retirementAge) * 12;
  const requiredCapital = calcRetirementCapital({
    monthlyIncome: retirementIncome,
    monthlyRate: retirementRate,
    retirementYears: lifeExpectancy - retirementAge,
  });

  // Fase de acumulação
  let balance = currentSavings;
  let totalInvested = currentSavings;
  const accumulation = [];

  for (let m = 1; m <= accumulationMonths; m++) {
    balance = balance * (1 + monthlyRate) + monthlyContrib;
    totalInvested += monthlyContrib;
    if (m % 12 === 0) {
      accumulation.push({
        year: currentAge + m / 12,
        balance: round(balance),
        totalInvested: round(totalInvested),
        goalPercent: round(Math.min((balance / requiredCapital) * 100, 100)),
      });
    }
  }

  const projectedCapital = round(balance);
  const surplus = round(projectedCapital - requiredCapital);
  const isOnTrack = projectedCapital >= requiredCapital;

  // Fase de retirada (simulada com o capital projetado)
  let withdrawBalance = projectedCapital;
  const withdrawal = [];
  for (let m = 1; m <= withdrawalMonths; m++) {
    withdrawBalance = withdrawBalance * (1 + retirementRate) - retirementIncome;
    if (m % 12 === 0) {
      withdrawal.push({
        year: retirementAge + m / 12,
        balance: round(Math.max(0, withdrawBalance)),
      });
    }
    if (withdrawBalance <= 0) break;
  }

  return {
    requiredCapital,
    projectedCapital,
    surplus,
    isOnTrack,
    accumulationMonths,
    totalInvested: round(totalInvested),
    accumulation,
    withdrawal,
  };
}
