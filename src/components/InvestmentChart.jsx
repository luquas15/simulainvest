import { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useSimulator } from '../context/SimulatorContext';
import { formatCurrency } from '../utils/finance';

// Tooltip customizado com estilo fintech
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-900">
      <p className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
        Mês {label}
      </p>
      {payload.map(entry => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-xs text-gray-600 dark:text-gray-300">{entry.name}:</span>
          <span className="text-xs font-semibold text-gray-900 dark:text-white">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

const VIEWS = [
  { key: 'balance',       label: 'Saldo Total' },
  { key: 'comparison',    label: 'Cenários' },
];

export default function InvestmentChart() {
  const { timelineData, scenarios } = useSimulator();
  const [activeView, setActiveView] = useState('balance');

  // Dados para a view de saldo (capital vs juros)
  const balanceData = useMemo(() =>
    timelineData.map(d => ({
      month: d.month,
      'Capital Investido': d.totalInvested,
      'Juros Acumulados':  d.totalInterest,
      'Saldo Total':       d.balance,
    })),
    [timelineData]
  );

  // Dados para comparação de cenários
  const comparisonData = useMemo(() => {
    const maxLen = Math.max(
      scenarios.conservative.data.length,
      scenarios.moderate.data.length,
      scenarios.aggressive.data.length,
    );
    return Array.from({ length: maxLen }, (_, i) => ({
      month: i + 1,
      Conservador: scenarios.conservative.data[i]?.balance ?? 0,
      Moderado:    scenarios.moderate.data[i]?.balance ?? 0,
      Agressivo:   scenarios.aggressive.data[i]?.balance ?? 0,
    }));
  }, [scenarios]);

  // Formata eixo Y de forma legível
  const yFormatter = value => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000)     return `${(value / 1_000).toFixed(0)}k`;
    return value;
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card dark:border-gray-800 dark:bg-gray-900">
      {/* Header com tabs */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Evolução Patrimonial
        </h2>
        <div className="flex rounded-xl border border-gray-100 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800">
          {VIEWS.map(v => (
            <button
              key={v.key}
              onClick={() => setActiveView(v.key)}
              className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-all ${
                activeView === v.key
                  ? 'bg-white text-brand shadow dark:bg-gray-700'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gráfico */}
      <ResponsiveContainer width="100%" height={300}>
        {activeView === 'balance' ? (
          <AreaChart data={balanceData} margin={{ top: 5, right: 5, bottom: 5, left: 10 }}>
            <defs>
              <linearGradient id="gradInvested" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradInterest" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#00D46A" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#00D46A" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" strokeOpacity={0.5} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => `M${v}`}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={yFormatter}
              width={55}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
              iconType="circle"
              iconSize={8}
            />
            <Area
              type="monotone"
              dataKey="Capital Investido"
              stackId="1"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#gradInvested)"
            />
            <Area
              type="monotone"
              dataKey="Juros Acumulados"
              stackId="1"
              stroke="#00D46A"
              strokeWidth={2}
              fill="url(#gradInterest)"
            />
          </AreaChart>
        ) : (
          <AreaChart data={comparisonData} margin={{ top: 5, right: 5, bottom: 5, left: 10 }}>
            <defs>
              <linearGradient id="gradCons" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradMod" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#8B5CF6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradAgg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#00D46A" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00D46A" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" strokeOpacity={0.5} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => `M${v}`}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={yFormatter}
              width={55}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} iconType="circle" iconSize={8} />
            <Area type="monotone" dataKey="Conservador" stroke="#3B82F6" strokeWidth={2} fill="url(#gradCons)" />
            <Area type="monotone" dataKey="Moderado"    stroke="#8B5CF6" strokeWidth={2} fill="url(#gradMod)" />
            <Area type="monotone" dataKey="Agressivo"   stroke="#00D46A" strokeWidth={2} fill="url(#gradAgg)" />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
