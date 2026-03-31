import { useMemo } from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { formatCurrency } from '../utils/finance';

function StatCard({ label, value, sub, highlight, className = '' }) {
  return (
    <div className={`rounded-2xl p-5 ${highlight
      ? 'bg-gradient-to-br from-brand to-green-500 text-white shadow-glow'
      : 'border border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800'
    } ${className}`}>
      <p className={`mb-1 text-xs font-medium uppercase tracking-wider ${highlight ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}`}>
        {label}
      </p>
      <p className={`text-2xl font-extrabold ${highlight ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
        {value}
      </p>
      {sub && (
        <p className={`mt-1 text-xs ${highlight ? 'text-white/60' : 'text-gray-400'}`}>{sub}</p>
      )}
    </div>
  );
}

export default function ResultsSummary() {
  const { summary, params, normalized } = useSimulator();

  const returnPct = useMemo(() => {
    if (!summary || summary.totalInvested === 0) return 0;
    return ((summary.finalBalance - summary.totalInvested) / summary.totalInvested) * 100;
  }, [summary]);

  if (!summary) return null;

  const periodLabel = params.periodType === 'years'
    ? `${params.periods} ${params.periods === 1 ? 'ano' : 'anos'}`
    : `${params.periods} ${params.periods === 1 ? 'mês' : 'meses'}`;

  return (
    <div className="animate-slide-up">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Resultado em {periodLabel}
        </h2>
        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
          +{returnPct.toFixed(1)}% de retorno
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Investido"
          value={formatCurrency(summary.totalInvested)}
          sub={`Inicial + aportes mensais`}
        />
        <StatCard
          label="Juros Ganhos"
          value={formatCurrency(summary.totalInterest)}
          sub={`${((summary.totalInterest / summary.totalInvested) * 100).toFixed(1)}% sobre o investido`}
        />
        <StatCard
          label="Saldo Final"
          value={formatCurrency(summary.finalBalance)}
          sub={normalized.inflationRate > 0 ? `Real: ${formatCurrency(summary.realBalance)}` : 'Valor bruto acumulado'}
          highlight
        />
      </div>

      {/* Barra de composição */}
      <div className="mt-4 rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Capital investido</span>
          <span>Juros compostos</span>
        </div>
        <div className="flex h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
          <div
            className="h-full bg-blue-400 transition-all duration-700"
            style={{ width: `${(summary.totalInvested / summary.finalBalance) * 100}%` }}
          />
          <div
            className="h-full flex-1 bg-brand transition-all duration-700"
          />
        </div>
        <div className="mt-2 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            <span className="text-gray-500 dark:text-gray-400">
              Capital ({((summary.totalInvested / summary.finalBalance) * 100).toFixed(0)}%)
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-brand" />
            <span className="text-gray-500 dark:text-gray-400">
              Juros ({((summary.totalInterest / summary.finalBalance) * 100).toFixed(0)}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
