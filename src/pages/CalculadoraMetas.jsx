import { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from 'recharts';
import {
  calcRequiredContrib,
  calcMonthsToGoal,
  simulateGoalProgress,
} from '../utils/goals';
import { annualToMonthlyRate, formatCurrency } from '../utils/finance';

const PRESETS = [
  { label: '🏖️ Viagem',        value: 15000 },
  { label: '🚗 Carro',         value: 60000 },
  { label: '🏠 Entrada imóvel', value: 120000 },
  { label: '🎓 Faculdade',     value: 50000 },
  { label: '💰 1 Milhão',      value: 1000000 },
];

function Slider({ label, id, min, max, step, value, onChange, format }) {
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
    </div>
  );
}

const BRL = v => `R$ ${Number(v).toLocaleString('pt-BR')}`;
const PCT = v => `${v}%`;
const MO  = v => `${v} meses`;

export default function CalculadoraMetas() {
  const [goalValue,     setGoalValue]     = useState(50000);
  const [initialValue,  setInitialValue]  = useState(2000);
  const [monthlyContrib,setMonthlyContrib]= useState(500);
  const [annualRate,    setAnnualRate]    = useState(12);
  const [periods,       setPeriods]       = useState(60);
  const [mode,          setMode]          = useState('contrib'); // 'contrib' | 'deadline'

  const monthlyRate = useMemo(() => annualToMonthlyRate(annualRate), [annualRate]);

  const requiredContrib = useMemo(() =>
    calcRequiredContrib({ goalValue, initialValue, monthlyRate, periods }),
    [goalValue, initialValue, monthlyRate, periods]
  );

  const monthsToGoal = useMemo(() =>
    calcMonthsToGoal({ goalValue, initialValue, monthlyContrib, monthlyRate }),
    [goalValue, initialValue, monthlyContrib, monthlyRate]
  );

  const chartData = useMemo(() =>
    simulateGoalProgress({
      goalValue,
      initialValue,
      monthlyContrib: mode === 'contrib' ? requiredContrib : monthlyContrib,
      monthlyRate,
      periods: mode === 'contrib' ? periods : (monthsToGoal ?? periods),
    }),
    [goalValue, initialValue, requiredContrib, monthlyContrib, monthlyRate, periods, mode, monthsToGoal]
  );

  const yFormatter = v => v >= 1_000_000 ? `${(v/1e6).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}k` : v;

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-10 text-center">
        <h1 className="mb-3 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
          Calculadora de Metas Financeiras
        </h1>
        <p className="mx-auto max-w-2xl text-gray-500 dark:text-gray-400">
          Defina seu objetivo e descubra quanto precisa guardar por mês — ou quando vai atingir
          sua meta com o aporte que já faz.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        {/* Formulário */}
        <div className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-card dark:border-gray-800 dark:bg-gray-900">
          {/* Presets */}
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Objetivos populares</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map(p => (
                <button key={p.label} onClick={() => setGoalValue(p.value)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                    goalValue === p.value
                      ? 'border-brand bg-brand/10 text-brand'
                      : 'border-gray-200 text-gray-600 hover:border-brand hover:text-brand dark:border-gray-700 dark:text-gray-400'
                  }`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <Slider label="Meta financeira" id="goal"    min={1000}  max={2000000} step={1000}  value={goalValue}      onChange={setGoalValue}      format={BRL} />
          <Slider label="Já tenho investido" id="init" min={0}     max={500000}  step={500}   value={initialValue}   onChange={setInitialValue}   format={BRL} />
          <Slider label="Taxa de juros anual" id="rate" min={1}    max={25}      step={0.5}   value={annualRate}     onChange={setAnnualRate}     format={PCT} />

          {/* Toggle de modo */}
          <div className="rounded-xl border border-dashed border-gray-200 p-4 dark:border-gray-700">
            <div className="mb-3 flex gap-2">
              {[
                { key: 'contrib', label: 'Calcular aporte' },
                { key: 'deadline', label: 'Calcular prazo' },
              ].map(m => (
                <button key={m.key} onClick={() => setMode(m.key)}
                  className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all ${
                    mode === m.key ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                  {m.label}
                </button>
              ))}
            </div>

            {mode === 'contrib'
              ? <Slider label="Prazo desejado" id="periods" min={1} max={360} step={1} value={periods} onChange={setPeriods} format={MO} />
              : <Slider label="Aporte mensal atual" id="contrib" min={0} max={20000} step={100} value={monthlyContrib} onChange={setMonthlyContrib} format={BRL} />
            }
          </div>
        </div>

        {/* Resultados */}
        <div className="space-y-6">
          {/* Card de resposta principal */}
          <div className="rounded-2xl bg-gradient-to-br from-brand to-green-500 p-6 text-white shadow-glow">
            {mode === 'contrib' ? (
              <>
                <p className="mb-1 text-sm font-medium text-white/70">Aporte mensal necessário</p>
                <p className="text-4xl font-extrabold">{formatCurrency(requiredContrib)}</p>
                <p className="mt-2 text-sm text-white/70">
                  Para atingir {formatCurrency(goalValue)} em {periods} meses
                  {initialValue > 0 ? ` partindo de ${formatCurrency(initialValue)}` : ''}
                </p>
              </>
            ) : (
              <>
                <p className="mb-1 text-sm font-medium text-white/70">Você atinge a meta em</p>
                {monthsToGoal ? (
                  <>
                    <p className="text-4xl font-extrabold">
                      {monthsToGoal < 12
                        ? `${monthsToGoal} meses`
                        : `${(monthsToGoal / 12).toFixed(1)} anos`}
                    </p>
                    <p className="mt-2 text-sm text-white/70">
                      Com {formatCurrency(monthlyContrib)}/mês à {annualRate}% a.a.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-extrabold">Impossível nessas condições</p>
                    <p className="mt-2 text-sm text-white/70">Aumente o aporte ou a taxa de retorno.</p>
                  </>
                )}
              </>
            )}
          </div>

          {/* Cards secundários */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total investido', value: formatCurrency(initialValue + (mode === 'contrib' ? requiredContrib : monthlyContrib) * (mode === 'contrib' ? periods : (monthsToGoal ?? 0))) },
              { label: 'Juros ganhos', value: formatCurrency(Math.max(0, goalValue - (initialValue + (mode === 'contrib' ? requiredContrib : monthlyContrib) * (mode === 'contrib' ? periods : (monthsToGoal ?? 0))))) },
              { label: 'Meta', value: formatCurrency(goalValue) },
            ].map(c => (
              <div key={c.label} className="rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">{c.label}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{c.value}</p>
              </div>
            ))}
          </div>

          {/* Gráfico de progresso */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
              Progresso em direção à meta
            </h2>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 10 }}>
                <defs>
                  <linearGradient id="gradGoal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00D46A" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00D46A" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" strokeOpacity={0.5} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} tickFormatter={v => `M${v}`} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} tickFormatter={yFormatter} width={55} />
                <ReferenceLine y={goalValue} stroke="#EF4444" strokeDasharray="6 3" label={{ value: 'Meta', fill: '#EF4444', fontSize: 11 }} />
                <Tooltip formatter={(v) => [formatCurrency(v), 'Saldo']} labelFormatter={l => `Mês ${l}`} contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
                <Area type="monotone" dataKey="balance" name="Saldo" stroke="#00D46A" strokeWidth={2} fill="url(#gradGoal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Conteúdo SEO */}
      <section className="mt-12 rounded-2xl border border-gray-100 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          Como definir metas financeiras realistas?
        </h2>
        <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          A metodologia SMART aplicada a finanças sugere que uma boa meta deve ser
          <strong> Específica</strong> (valor exato), <strong>Mensurável</strong> (acompanhar o progresso),
          <strong> Alcançável</strong> (compatível com sua renda), <strong>Relevante</strong> (motivadora) e
          <strong> Temporal</strong> (prazo definido). Use esta calculadora para transformar sonhos em planos concretos.
        </p>
      </section>
    </main>
  );
}
