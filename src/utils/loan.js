/**
 * loan.js — Calculadora de Financiamento
 * Suporta sistemas Price (parcelas fixas) e SAC (amortização constante).
 */

import { round } from './finance';

/**
 * Sistema PRICE — Parcela fixa.
 * PMT = PV * i / (1 - (1+i)^-n)
 */
export function calcPrice({ principal, monthlyRate, periods }) {
  if (monthlyRate === 0) {
    const pmt = round(principal / periods);
    return {
      installment: pmt,
      totalPaid: round(pmt * periods),
      totalInterest: 0,
      table: Array.from({ length: periods }, (_, i) => ({
        month: i + 1,
        installment: pmt,
        amortization: pmt,
        interest: 0,
        balance: round(principal - pmt * (i + 1)),
      })),
    };
  }

  const factor = Math.pow(1 + monthlyRate, periods);
  const pmt = round(principal * monthlyRate * factor / (factor - 1));

  let balance = principal;
  const table = [];

  for (let m = 1; m <= periods; m++) {
    const interest = round(balance * monthlyRate);
    const amortization = round(pmt - interest);
    balance = round(balance - amortization);

    table.push({
      month: m,
      installment: pmt,
      amortization,
      interest,
      balance: Math.max(0, balance),
    });
  }

  const totalPaid = round(pmt * periods);
  return {
    installment: pmt,
    totalPaid,
    totalInterest: round(totalPaid - principal),
    table,
  };
}

/**
 * Sistema SAC — Amortização constante, juros decrescentes.
 * Amortização = PV / n (fixa)
 * Juros = saldo devedor * i (decrescente)
 * Parcela = amortização + juros (decrescente)
 */
export function calcSAC({ principal, monthlyRate, periods }) {
  const amortization = round(principal / periods);
  let balance = principal;
  const table = [];

  for (let m = 1; m <= periods; m++) {
    const interest = round(balance * monthlyRate);
    const installment = round(amortization + interest);
    balance = round(balance - amortization);

    table.push({
      month: m,
      installment,
      amortization,
      interest,
      balance: Math.max(0, balance),
    });
  }

  const totalPaid = round(table.reduce((s, r) => s + r.installment, 0));
  return {
    installment: table[0].installment, // primeira parcela (a maior)
    lastInstallment: table[table.length - 1].installment,
    totalPaid,
    totalInterest: round(totalPaid - principal),
    table,
  };
}

/**
 * Compara os dois sistemas.
 */
export function compareSystems({ principal, monthlyRate, periods }) {
  const price = calcPrice({ principal, monthlyRate, periods });
  const sac   = calcSAC({ principal, monthlyRate, periods });
  return { price, sac };
}

/**
 * Calcula o máximo que se pode financiar dado uma parcela máxima.
 * Fórmula inversa do Price: PV = PMT * (1 - (1+i)^-n) / i
 */
export function calcMaxLoan({ maxInstallment, monthlyRate, periods }) {
  if (monthlyRate === 0) return round(maxInstallment * periods);
  return round(maxInstallment * (1 - Math.pow(1 + monthlyRate, -periods)) / monthlyRate);
}
