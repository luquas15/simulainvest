import { useSimulator } from '../context/SimulatorContext';
import { formatCurrency } from '../utils/finance';

export default function SimulationHistory() {
  const { history, updateParam } = useSimulator();

  if (!history.length) return null;

  function restoreSimulation(params) {
    updateParam('initialValue',    params.initialValue);
    updateParam('monthlyContrib',  params.monthlyContrib);
    updateParam('annualRate',      params.annualRate);
    updateParam('rateType',        params.rateType);
    updateParam('periods',         params.periods);
    updateParam('periodType',      params.periodType);
    updateParam('inflationRate',   params.inflationRate);
    updateParam('includeInflation',params.includeInflation);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card dark:border-gray-800 dark:bg-gray-900">
      <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
        Simulações recentes
      </h3>
      <div className="space-y-2">
        {history.map((h, i) => (
          <button
            key={h.id}
            onClick={() => restoreSimulation(h.params)}
            className="group flex w-full items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-left transition-all hover:border-brand/30 hover:bg-brand/5 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                {i + 1}
              </span>
              <div>
                <p className="text-xs font-medium text-gray-700 group-hover:text-brand dark:text-gray-300">
                  {h.label}
                </p>
                <p className="text-xs text-gray-400">{h.savedAt}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-brand">{formatCurrency(h.finalBalance)}</p>
              <p className="text-xs text-gray-400">resultado</p>
            </div>
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-gray-400">
        Clique para restaurar qualquer simulação anterior.
      </p>
    </div>
  );
}
