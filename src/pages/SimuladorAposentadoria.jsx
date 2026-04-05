import { useState, useMemo, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';
import { simulateRetirement, calcRetirementCapital } from '../utils/goals';
import { annualToMonthlyRate, formatCurrency } from '../utils/finance';
import { useMarketData } from '../context/MarketDataContext';
import AdUnit, { AD_SLOTS } from '../components/AdUnit';
import { usePageTitle } from '../hooks/usePageTitle';

function Slider({ label, id, min, max, step, value, onChange, format, hint }) {
  return (
    <div>
      <div className="mb-1 flex justify-between">
        <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <span className="rounded-md bg-brand/10 px-2 py-0.5 text-sm font-semibold text-brand">{format(value)}</span>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-brand dark:bg-gray-700"
      />
      {hint && <p className="mt-0.5 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

export default function SimuladorAposentadoria() {
  usePageTitle('Simulador de Aposentadoria');
  const { rates } = useMarketData();
  const [currentAge,       setCurrentAge]       = useState(30);
  const [retirementAge,    setRetirementAge]     = useState(60);
  const [lifeExpectancy,   setLifeExpectancy]    = useState(85);
  const [currentSavings,   setCurrentSavings]    = useState(20000);
  const [monthlyContrib,   setMonthlyContrib]    = useState(800);
  const [retirementIncome, setRetirementIncome]  = useState(5000);
  const [annualRate,       setAnnualRate]        = useState(12);
  const [retirementRate,   setRetirementRate]    = useState(8);

  // Fase de acumulação: usa Selic ao vivo; fase de retirada: Selic - IPCA (juro real)
  useEffect(() => {
    if (rates.source === 'initial') return;
    setAnnualRate(parseFloat(rates.selic.toFixed(2)));
    // Juro real aproximado para fase conservadora de retirada
    const realRate = Math.max(3, parseFloat((rates.selic - rates.ipca12m).toFixed(2)));
    setRetirementRate(realRate);
  }, [rates.selic, rates.ipca12m, rates.source]);

  const monthlyRate     = useMemo(() => annualToMonthlyRate(annualRate), [annualRate]);
  const retMonthlyRate  = useMemo(() => annualToMonthlyRate(retirementRate), [retirementRate]);

  const result = useMemo(() => simulateRetirement({
    currentAge,
    retirementAge,
    lifeExpectancy,
    currentSavings,
    monthlyContrib,
    monthlyRate,
    retirementIncome,
    retirementRate: retMonthlyRate,
  }), [currentAge, retirementAge, lifeExpectancy, currentSavings, monthlyContrib, monthlyRate, retirementIncome, retMonthlyRate]);

  // Combinar dados de acumulação e retirada para o gráfico
  const chartData = useMemo(() => [
    ...result.accumulation.map(d => ({ year: d.year, 'Patrimônio': d.balance, goalPercent: d.goalPercent })),
    ...result.withdrawal.map(d => ({ year: d.year, 'Retirada': d.balance })),
  ], [result]);

  const yFormatter = v => v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}k` : v;

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-10 text-center">
        <h1 className="mb-3 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
          Simulador de Aposentadoria
        </h1>
        <p className="mx-auto max-w-2xl text-gray-500 dark:text-gray-400">
          Planeje sua independência financeira. Veja quanto você precisa acumular e se está
          no caminho certo para se aposentar com a renda desejada.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        {/* Formulário */}
        <div className="space-y-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-card dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Seu perfil</h2>

          <div className="grid grid-cols-2 gap-4">
            <Slider label="Idade atual"        id="age"     min={18} max={65} step={1} value={currentAge}     onChange={setCurrentAge}     format={v => `${v} anos`} />
            <Slider label="Aposentadoria"      id="ret"     min={45} max={80} step={1} value={retirementAge}  onChange={setRetirementAge}  format={v => `${v} anos`} />
          </div>

          <Slider label="Expectativa de vida" id="life"    min={70} max={100} step={1} value={lifeExpectancy} onChange={setLifeExpectancy} format={v => `${v} anos`} />
          <Slider label="Patrimônio atual"    id="savings" min={0} max={500000} step={1000} value={currentSavings}  onChange={setCurrentSavings}  format={v => `R$ ${Number(v).toLocaleString('pt-BR')}`} />
          <Slider label="Aporte mensal"       id="contrib" min={0} max={10000}  step={100}  value={monthlyContrib}  onChange={setMonthlyContrib}  format={v => `R$ ${Number(v).toLocaleString('pt-BR')}`} />
          <Slider label="Renda mensal desejada na aposentadoria" id="income" min={1000} max={30000} step={500} value={retirementIncome} onChange={setRetirementIncome} format={v => `R$ ${Number(v).toLocaleString('pt-BR')}`} />

          <div className="rounded-xl border border-dashed border-gray-200 p-4 space-y-4 dark:border-gray-700">
            <Slider label="Retorno na acumulação" id="rate"  min={4} max={25} step={0.5} value={annualRate}      onChange={setAnnualRate}      format={v => `${v}% a.a.`} hint="Fase de crescimento do patrimônio" />
            <Slider label="Retorno na aposentadoria" id="rrate" min={3} max={15} step={0.5} value={retirementRate} onChange={setRetirementRate} format={v => `${v}% a.a.`} hint="Fase conservadora de retirada" />
          </div>
        </div>

        {/* Resultados */}
        <div className="space-y-6">
          {/* Status card */}
          <div className={`rounded-2xl p-6 text-white shadow-glow ${result.isOnTrack ? 'bg-gradient-to-br from-brand to-green-500' : 'bg-gradient-to-br from-orange-500 to-red-500'}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="mb-1 text-sm font-medium text-white/70">
                  {result.isOnTrack ? '✅ Você está no caminho certo!' : '⚠️ Ajuste necessário'}
                </p>
                <p className="text-3xl font-extrabold">{formatCurrency(result.projectedCapital)}</p>
                <p className="mt-1 text-sm text-white/70">patrimônio projetado na aposentadoria</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/70">Meta necessária</p>
                <p className="text-xl font-bold">{formatCurrency(result.requiredCapital)}</p>
              </div>
            </div>

            {/* Barra de progresso */}
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-white/70">
                <span>Acumulado projetado</span>
                <span>{Math.min(100, ((result.projectedCapital / result.requiredCapital) * 100)).toFixed(0)}% da meta</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white transition-all duration-700"
                  style={{ width: `${Math.min(100, (result.projectedCapital / result.requiredCapital) * 100)}%` }}
                />
              </div>
            </div>

            {result.isOnTrack ? (
              <p className="mt-3 text-sm text-white/80">
                🎉 Você terá {formatCurrency(result.surplus)} a mais do que o necessário!
              </p>
            ) : (
              <p className="mt-3 text-sm text-white/80">
                Faltam {formatCurrency(Math.abs(result.surplus))} — aumente o aporte em{' '}
                {formatCurrency(Math.abs(result.surplus) / result.accumulationMonths)}/mês
              </p>
            )}
          </div>

          {/* Cards de resumo */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Anos até aposentadoria', value: `${retirementAge - currentAge} anos` },
              { label: 'Total investido',         value: formatCurrency(result.totalInvested) },
              { label: 'Capital necessário',      value: formatCurrency(result.requiredCapital) },
              { label: 'Renda mensal',            value: formatCurrency(retirementIncome) },
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
              Acumulação → Aposentadoria → Retirada
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 10 }}>
                <defs>
                  <linearGradient id="gradAcc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00D46A" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00D46A" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gradRet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#8B5CF6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" strokeOpacity={0.5} />
                <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}a`} />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} tickFormatter={yFormatter} width={55} />
                <ReferenceLine x={retirementAge} stroke="#EF4444" strokeDasharray="6 3" label={{ value: 'Aposentadoria', fill: '#EF4444', fontSize: 10 }} />
                <Tooltip formatter={(v) => [formatCurrency(v)]} labelFormatter={l => `Idade: ${l} anos`} contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" iconSize={8} />
                <Area type="monotone" dataKey="Patrimônio" stroke="#00D46A" strokeWidth={2} fill="url(#gradAcc)" connectNulls />
                <Area type="monotone" dataKey="Retirada"   stroke="#8B5CF6" strokeWidth={2} fill="url(#gradRet)" connectNulls />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <AdUnit slot={AD_SLOTS.RELAXED} className="mt-8" />

      {/* Dicas SEO */}
      <section className="mt-12 grid gap-6 sm:grid-cols-3">
        {[
          { title: 'Regra dos 4%', desc: 'Uma estratégia popular: você pode sacar 4% do patrimônio por ano sem esgotá-lo. Para uma renda de R$ 5.000/mês, precisa de R$ 1.500.000 acumulados.' },
          { title: 'INSS vs Previdência privada', desc: 'O teto do INSS em 2026 é R$ 8.157. Se você quer mais, previdência privada (PGBL/VGBL) ou investimentos próprios são essenciais.' },
          { title: 'Comece cedo', desc: 'Quem começa aos 25 anos investe 3x menos do que quem começa aos 35 para a mesma aposentadoria. O tempo é o maior aliado dos juros compostos.' },
        ].map(c => (
          <div key={c.title} className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-2 font-bold text-gray-900 dark:text-white">{c.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{c.desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
