import { useState, useMemo } from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { formatCurrency } from '../utils/finance';

const PAGE_SIZE = 12;

export default function TimelineTable() {
  const { timelineData } = useSimulator();
  const [page, setPage] = useState(1);
  const [showAll, setShowAll] = useState(false);

  const displayed = useMemo(() => {
    if (showAll) return timelineData;
    return timelineData.slice(0, page * PAGE_SIZE);
  }, [timelineData, page, showAll]);

  const hasMore = !showAll && page * PAGE_SIZE < timelineData.length;

  if (!timelineData.length) return null;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-card dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-700">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Linha do Tempo Mensal
          </h2>
          <p className="text-xs text-gray-400">{timelineData.length} meses de simulação</p>
        </div>
        <button
          onClick={() => setShowAll(s => !s)}
          className="text-xs font-medium text-brand transition-colors hover:text-brand-dark"
        >
          {showAll ? 'Mostrar menos' : 'Ver todos'}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-50 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-800/50">
              {['Mês', 'Total Investido', 'Juros do Mês', 'Juros Acumulados', 'Saldo'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {displayed.map((row, i) => {
              // Destaque a cada ano
              const isYearMark = row.month % 12 === 0;
              return (
                <tr
                  key={row.month}
                  className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                    isYearMark ? 'bg-brand/3 dark:bg-brand/5' : ''
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                    {row.month}
                    {isYearMark && (
                      <span className="ml-1 rounded bg-brand/10 px-1 py-0.5 text-xs text-brand">
                        {row.month / 12}º ano
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {formatCurrency(row.totalInvested)}
                  </td>
                  <td className="px-4 py-3 font-medium text-green-600 dark:text-green-400">
                    +{formatCurrency(row.monthInterest)}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {formatCurrency(row.totalInterest)}
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
                    {formatCurrency(row.balance)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="border-t border-gray-100 px-6 py-4 dark:border-gray-700">
          <button
            onClick={() => setPage(p => p + 1)}
            className="w-full rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition-all hover:border-brand hover:text-brand dark:border-gray-700 dark:text-gray-400"
          >
            Carregar mais {Math.min(PAGE_SIZE, timelineData.length - page * PAGE_SIZE)} meses
          </button>
        </div>
      )}
    </div>
  );
}
