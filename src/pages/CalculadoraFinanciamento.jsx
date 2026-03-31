import { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { compareSystems, calcMaxLoan } from '../utils/loan';
import { annualToMonthlyRate, formatCurrency } from '../utils/finance';

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

const PAGE_SIZE = 12;

export default function CalculadoraFinanciamento() {
  const [principal,    setPrincipal]    = useState(300000);
  const [annualRate,   setAnnualRate]   = useState(11);
  const [periods,      setPeriods]      = useState(360);
  const [activeSystem, setActiveSystem] = useState('price'); // 'price' | 'sac'
  const [showTable,    setShowTable]    = useState(false);
  const [tablePage,    setTablePage]    = useState(1);

  const monthlyRate = useMemo(() => annualToMonthlyRate(annualRate), [annualRate]);

  const { price, sac } = useMemo(
    () => compareSystems({ principal, monthlyRate, periods }),
    [principal, monthlyRate, periods]
  );

  const active = activeSystem === 'price' ? price : sac;

  // Dados de progresso para o gráfico (amortização vs juros ao longo do tempo)
  const chartData = useMemo(() => {
    const step = Math.ceil(active.table.length / 60); // máx 60 pontos
    return active.table
      .filter((_, i) => i % step === 0 || i === active.table.length - 1)
      .map(r => ({
        month: r.month,
        Amortização: r.amortization,
        Juros: r.interest,
        Saldo: r.balance,
      }));
  }, [active]);

  const displayedRows = useMemo(
    () => active.table.slice(0, tablePage * PAGE_SIZE),
    [active.table, tablePage]
  );

  const savings = price.totalPaid - sac.totalPaid;

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-10 text-center">
        <h1 className="mb-3 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
          Calculadora de Financiamento
        </h1>
        <p className="mx-auto max-w-2xl text-gray-500 dark:text-gray-400">
          Simule financiamentos imobiliários ou de veículos. Compare os sistemas Price
          (parcelas fixas) e SAC (amortização constante) e veja o quanto você paga de juros.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        {/* Formulário */}
        <div className="space-y-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-card dark:border-gray-800 dark:bg-gray-900">
          <Slider label="Valor do financiamento" id="principal" min={10000} max={2000000} step={5000}
            value={principal} onChange={setPrincipal} format={v => `R$ ${Number(v).toLocaleString('pt-BR')}`} />
          <Slider label="Taxa de juros anual" id="rate" min={1} max={25} step={0.25}
            value={annualRate} onChange={setAnnualRate} format={v => `${v}% a.a.`}
            hint={`Mensal: ${(monthlyRate * 100).toFixed(3)}%`} />
          <Slider label="Prazo (meses)" id="periods" min={12} max={420} step={12}
            value={periods} onChange={setPeriods}
            format={v => `${v}m (${(v/12).toFixed(0)} anos)`} />

          {/* Máximo que pode financiar */}
          <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
            <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
              Capacidade máxima com parcela de R$ 3.000/mês
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(calcMaxLoan({ maxInstallment: 3000, monthlyRate, periods }))}
            </p>
          </div>

          {/* Toggle sistema */}
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Sistema de amortização</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'price', label: 'PRICE', desc: 'Parcela fixa' },
                { key: 'sac',   label: 'SAC',   desc: 'Amort. constante' },
              ].map(s => (
                <button key={s.key} onClick={() => setActiveSystem(s.key)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    activeSystem === s.key
                      ? 'border-brand bg-brand/5 dark:bg-brand/10'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}>
                  <p className={`font-bold text-sm ${activeSystem === s.key ? 'text-brand' : 'text-gray-900 dark:text-white'}`}>{s.label}</p>
                  <p className="text-xs text-gray-400">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="space-y-6">
          {/* Resumo */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              {
                label: activeSystem === 'price' ? 'Parcela fixa' : '1ª parcela',
                value: formatCurrency(activeSystem === 'price' ? price.installment : sac.installment),
                highlight: true,
              },
              {
                label: activeSystem === 'sac' ? 'Última parcela' : 'Total pago',
                value: activeSystem === 'sac' ? formatCurrency(sac.lastInstallment) : formatCurrency(price.totalPaid),
              },
              { label: 'Total em juros', value: formatCurrency(active.totalInterest) },
              { label: '% de juros', value: `${((active.totalInterest / principal) * 100).toFixed(1)}%` },
            ].map(c => (
              <div key={c.label} className={`rounded-xl p-4 ${c.highlight ? 'bg-gradient-to-br from-brand to-green-500 text-white shadow-glow' : 'border border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800'}`}>
                <p className={`mb-1 text-xs ${c.highlight ? 'text-white/70' : 'text-gray-400'}`}>{c.label}</p>
                <p className={`text-xl font-extrabold ${c.highlight ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{c.value}</p>
              </div>
            ))}
          </div>

          {/* Comparativo Price vs SAC */}
          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
            <p className="mb-1 text-sm font-semibold text-blue-700 dark:text-blue-400">
              💡 Comparativo Price vs SAC
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-300">
              No SAC você paga {formatCurrency(savings)} a menos de juros no total, mas a 1ª parcela é{' '}
              {formatCurrency(sac.installment - price.installment)} mais cara que o PRICE.
            </p>
          </div>

          {/* Gráfico */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
              Composição da parcela (Amortização vs Juros)
            </h2>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 10 }}>
                <defs>
                  <linearGradient id="gradAmort" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00D46A" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00D46A" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gradJuros" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#EF4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" strokeOpacity={0.5} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} tickFormatter={v => `M${v}`} />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false}
                  tickFormatter={v => `${(v/1000).toFixed(0)}k`} width={45} />
                <Tooltip formatter={v => [formatCurrency(v)]} labelFormatter={l => `Mês ${l}`}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" iconSize={8} />
                <Area type="monotone" dataKey="Amortização" stroke="#00D46A" strokeWidth={2} fill="url(#gradAmort)" stackId="1" />
                <Area type="monotone" dataKey="Juros"       stroke="#EF4444" strokeWidth={2} fill="url(#gradJuros)" stackId="1" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Tabela de amortização */}
          <div>
            <button onClick={() => setShowTable(s => !s)}
              className="mb-4 text-sm font-medium text-brand hover:text-brand-dark">
              {showTable ? '▲ Ocultar tabela de amortização' : '▼ Ver tabela de amortização completa'}
            </button>

            {showTable && (
              <div className="rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-50 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-800/50">
                        {['Mês', 'Parcela', 'Amortização', 'Juros', 'Saldo devedor'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                      {displayedRows.map(row => (
                        <tr key={row.month} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{row.month}</td>
                          <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-white">{formatCurrency(row.installment)}</td>
                          <td className="px-4 py-2.5 text-green-600 dark:text-green-400">{formatCurrency(row.amortization)}</td>
                          <td className="px-4 py-2.5 text-red-500">{formatCurrency(row.interest)}</td>
                          <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{formatCurrency(row.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {tablePage * PAGE_SIZE < active.table.length && (
                  <div className="border-t border-gray-100 px-6 py-4 dark:border-gray-700">
                    <button onClick={() => setTablePage(p => p + 1)}
                      className="w-full rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition-all hover:border-brand hover:text-brand dark:border-gray-700 dark:text-gray-400">
                      Carregar mais meses
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SEO content */}
      <section className="mt-12 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-3 font-bold text-gray-900 dark:text-white">Quando escolher o SAC?</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            O SAC é melhor financeiramente: você paga menos juros no total e a dívida cai mais rápido.
            Porém exige parcelas maiores no início. Ideal para quem tem renda mais alta agora ou espera aumento salarial.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-3 font-bold text-gray-900 dark:text-white">CET — Custo Efetivo Total</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            A taxa anunciada nem sempre é o custo real. O CET inclui seguros obrigatórios, tarifas e IOF.
            Compare sempre o CET entre bancos — pode variar até 3% ao ano no mesmo produto.
          </p>
        </div>
      </section>
    </main>
  );
}
