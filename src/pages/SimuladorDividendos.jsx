import { useState, useMemo, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';
import { annualToMonthlyRate, formatCurrency } from '../utils/finance';
import { useMarketData } from '../context/MarketDataContext';
import AdUnit, { AD_SLOTS } from '../components/AdUnit';
import { usePageTitle } from '../hooks/usePageTitle';
import SliderInput from '../components/SliderInput';


export default function SimuladorDividendos() {
  usePageTitle('Simulador de Dividendos');
  const { rates } = useMarketData();

  const [capital,             setCapital]             = useState(10000);
  const [monthlyContrib,      setMonthlyContrib]      = useState(500);
  const [annualAppreciation,  setAnnualAppreciation]  = useState(8);
  const [dividendYield,       setDividendYield]       = useState(8);
  const [years,               setYears]               = useState(20);
  const [targetIncome,        setTargetIncome]        = useState(5000);
  const [reinvestDividends,   setReinvestDividends]   = useState(false);

  // Sync appreciation rate with live Selic - IPCA (real rate)
  useEffect(() => {
    if (rates.source === 'initial') return;
    const realRate = Math.max(4, parseFloat((rates.selic - rates.ipca12m).toFixed(2)));
    setAnnualAppreciation(realRate);
  }, [rates.selic, rates.ipca12m, rates.source]);

  const { chartData, targetYear, finalPatrimonio, finalRendaMensal, totalInvested, totalDividendsReceived } = useMemo(() => {
    const monthlyAppRate = annualToMonthlyRate(annualAppreciation);
    const monthlyDY = dividendYield / 100 / 12;
    let balance = capital;
    const data = [];
    let foundTargetYear = null;
    let accumulatedDividends = 0;

    for (let m = 0; m <= years * 12; m++) {
      const monthlyDividend = balance * monthlyDY;

      if (!reinvestDividends) {
        accumulatedDividends += monthlyDividend;
      }

      if (reinvestDividends) {
        balance = balance * (1 + monthlyAppRate + monthlyDY) + monthlyContrib;
      } else {
        balance = balance * (1 + monthlyAppRate) + monthlyContrib;
      }

      if (m % 12 === 0) {
        const rendaMensal = Math.round(balance * monthlyDY);
        data.push({
          year: m / 12,
          patrimonio: Math.round(balance),
          rendaMensal,
        });

        if (foundTargetYear === null && rendaMensal >= targetIncome) {
          foundTargetYear = m / 12;
        }
      }
    }

    const last = data[data.length - 1];
    const invested = capital + monthlyContrib * years * 12;

    return {
      chartData: data,
      targetYear: foundTargetYear,
      finalPatrimonio: last ? last.patrimonio : 0,
      finalRendaMensal: last ? last.rendaMensal : 0,
      totalInvested: invested,
      totalDividendsReceived: Math.round(accumulatedDividends),
    };
  }, [capital, monthlyContrib, annualAppreciation, dividendYield, years, targetIncome, reinvestDividends]);

  const yFormatter = v =>
    v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v;

  const heroIsGreen = targetYear !== null;

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-10 text-center">
        <h1 className="mb-3 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
          Simulador de Renda Passiva com Dividendos
        </h1>
        <p className="mx-auto max-w-2xl text-gray-500 dark:text-gray-400">
          Descubra quanto sua carteira pode gerar de renda mensal através de dividendos e quanto
          tempo leva para atingir sua meta de independência financeira.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        {/* Painel de controles */}
        <div className="space-y-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-card dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Parâmetros da simulação</h2>

          <SliderInput
            label="Capital inicial"
            id="capital"
            min={1000}
            max={1000000}
            step={1000}
            value={capital}
            onChange={setCapital}
            format={v => `R$ ${Number(v).toLocaleString('pt-BR')}`}
          />

          <SliderInput
            label="Aporte mensal"
            id="contrib"
            min={0}
            max={10000}
            step={100}
            value={monthlyContrib}
            onChange={setMonthlyContrib}
            format={v => `R$ ${Number(v).toLocaleString('pt-BR')}`}
          />

          <div className="rounded-xl border border-dashed border-gray-200 p-4 space-y-4 dark:border-gray-700">
            <SliderInput
              label="Dividend Yield anual"
              id="dy"
              min={2}
              max={20}
              step={0.5}
              value={dividendYield}
              onChange={setDividendYield}
              format={v => `${v}% a.a.`}
              hint="Rendimento médio em dividendos da carteira"
            />
            <SliderInput
              label="Valorização anual do capital"
              id="appreciation"
              min={0}
              max={20}
              step={0.5}
              value={annualAppreciation}
              onChange={setAnnualAppreciation}
              format={v => `${v}% a.a.`}
              hint="Crescimento do preço dos ativos (ex.: juro real)"
            />
          </div>

          <SliderInput
            label="Horizonte"
            id="years"
            min={5}
            max={40}
            step={1}
            value={years}
            onChange={setYears}
            format={v => `${v} anos`}
          />

          <SliderInput
            label="Meta de renda passiva"
            id="target"
            min={1000}
            max={50000}
            step={500}
            value={targetIncome}
            onChange={setTargetIncome}
            format={v => `R$ ${Number(v).toLocaleString('pt-BR')}/mês`}
            hint="Quando sua renda mensal em dividendos atingir esse valor"
          />

          {/* Toggle reinvestimento */}
          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Reinvestir dividendos</p>
              <p className="text-xs text-gray-400">Ativa o efeito dos juros compostos totais</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={reinvestDividends}
              onClick={() => setReinvestDividends(v => !v)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 ${reinvestDividends ? 'bg-brand' : 'bg-gray-200 dark:bg-gray-600'}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${reinvestDividends ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>
        </div>

        {/* Resultados */}
        <div className="space-y-6">
          {/* Hero card */}
          <div
            className={`rounded-2xl p-6 text-white shadow-glow ${heroIsGreen ? 'bg-gradient-to-br from-brand to-green-500' : 'bg-gradient-to-br from-orange-500 to-red-500'}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="mb-1 text-sm font-medium text-white/70">
                  {heroIsGreen ? '✅ Meta alcançável!' : '⚠️ Meta ainda não atingida no período'}
                </p>
                <p className="text-3xl font-extrabold">{formatCurrency(finalRendaMensal)}<span className="ml-1 text-base font-medium text-white/70">/mês</span></p>
                <p className="mt-1 text-sm text-white/70">renda mensal projetada ao final do período</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm text-white/70">Meta</p>
                <p className="text-xl font-bold">{formatCurrency(targetIncome)}/mês</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-white/70">
                <span>Progresso em relação à meta</span>
                <span>{Math.min(100, ((finalRendaMensal / targetIncome) * 100)).toFixed(0)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white transition-all duration-700"
                  style={{ width: `${Math.min(100, (finalRendaMensal / targetIncome) * 100)}%` }}
                />
              </div>
            </div>

            <p className="mt-3 text-sm text-white/80">
              {heroIsGreen
                ? `🎉 Você atinge ${formatCurrency(targetIncome)}/mês em ${targetYear} anos!`
                : `Você atingirá ${formatCurrency(finalRendaMensal)}/mês em ${years} anos — aumente o aporte para chegar mais rápido`}
            </p>
          </div>

          {/* Cards de resumo */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Patrimônio final',            value: formatCurrency(finalPatrimonio) },
              { label: 'Renda mensal projetada',      value: `${formatCurrency(finalRendaMensal)}/mês` },
              { label: 'Total investido',             value: formatCurrency(totalInvested) },
              { label: 'Total em dividendos recebidos', value: reinvestDividends ? '(reinvestido)' : formatCurrency(totalDividendsReceived) },
            ].map(c => (
              <div key={c.label} className="rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <p className="mb-1 text-xs text-gray-400">{c.label}</p>
                <p className="font-bold text-gray-900 dark:text-white">{c.value}</p>
              </div>
            ))}
          </div>

          {/* Gráfico */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
              Evolução do patrimônio e renda mensal
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 10 }}>
                <defs>
                  <linearGradient id="gradPatrimonio" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00D46A" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00D46A" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gradRenda" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#8B5CF6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" strokeOpacity={0.5} />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => `${v}a`}
                />
                <YAxis
                  yAxisId="patrimonio"
                  orientation="left"
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={yFormatter}
                  width={55}
                />
                <YAxis
                  yAxisId="renda"
                  orientation="right"
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={yFormatter}
                  width={55}
                />
                {targetYear !== null && (
                  <ReferenceLine
                    x={targetYear}
                    yAxisId="patrimonio"
                    stroke="#EF4444"
                    strokeDasharray="6 3"
                    label={{ value: 'Meta atingida', fill: '#EF4444', fontSize: 10 }}
                  />
                )}
                <Tooltip
                  formatter={(v, name) => [formatCurrency(v), name]}
                  labelFormatter={l => `Ano ${l}`}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" iconSize={8} />
                <Area
                  yAxisId="patrimonio"
                  type="monotone"
                  dataKey="patrimonio"
                  name="Patrimônio"
                  stroke="#00D46A"
                  strokeWidth={2}
                  fill="url(#gradPatrimonio)"
                />
                <Area
                  yAxisId="renda"
                  type="monotone"
                  dataKey="rendaMensal"
                  name="Renda Mensal"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  fill="url(#gradRenda)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <AdUnit slot={AD_SLOTS.HORIZONTAL} className="mt-8" />

      {/* Cards informativos / SEO */}
      <section className="mt-12 grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-2 font-bold text-gray-900 dark:text-white">O que é Dividend Yield?</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Dividend Yield (DY) é a relação entre os dividendos pagos por um ativo e seu preço de
            mercado, expressa em percentual anual. Um DY de 8% significa que, para cada R$ 1.000
            investidos, você recebe R$ 80/ano em dividendos — independentemente da valorização
            do ativo. Quanto maior o DY, maior a renda passiva gerada pela carteira.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-2 font-bold text-gray-900 dark:text-white">FIIs vs Ações: qual paga mais?</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Fundos de Investimento Imobiliário (FIIs) costumam distribuir entre 8% e 12% ao ano em
            proventos isentos de IR para pessoas físicas, com pagamentos mensais. Já as ações de
            empresas pagadoras (Bancos, Utilities, Petrobras) geralmente entregam entre 3% e 6% de DY
            anual. FIIs são ideais para quem prioriza fluxo de caixa; ações combinam dividendo com
            maior potencial de valorização de longo prazo.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-2 font-bold text-gray-900 dark:text-white">Regra dos 4% vs DY</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            A Regra dos 4% prevê sacar 4% do patrimônio por ano sem esgotá-lo em 30 anos — equivalente
            a um "DY sintético" de 4%. Uma carteira com DY real de 8% pode gerar o dobro de renda
            sem vender nenhum ativo, preservando o patrimônio para gerações futuras. A desvantagem é
            que ativos de alto DY tendem a crescer menos de preço, exigindo maior capital inicial para
            a mesma renda-alvo.
          </p>
        </div>
      </section>
    </main>
  );
}
