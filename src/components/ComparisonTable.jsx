import { useSimulator } from '../context/SimulatorContext';
import { formatCurrency } from '../utils/finance';

export default function ComparisonTable() {
  const { scenarios } = useSimulator();

  const rows = [
    { key: 'conservative', ...scenarios.conservative },
    { key: 'moderate',     ...scenarios.moderate },
    { key: 'aggressive',   ...scenarios.aggressive },
  ];

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card dark:border-gray-800 dark:bg-gray-900">
      <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
        Comparação de Cenários
      </h2>
      <p className="mb-5 text-sm text-gray-400">
        Veja como diferentes taxas de retorno impactam seu patrimônio
      </p>

      <div className="space-y-4">
        {rows.map(scenario => {
          const pct = scenario.totalInvested > 0
            ? ((scenario.totalInterest / scenario.totalInvested) * 100).toFixed(1)
            : '0';

          return (
            <div
              key={scenario.key}
              className="rounded-xl border border-gray-100 p-4 transition-shadow hover:shadow-md dark:border-gray-700"
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: scenario.color }}
                    />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {scenario.label}
                    </span>
                    <span className="rounded-md px-2 py-0.5 text-xs font-medium"
                      style={{ backgroundColor: `${scenario.color}20`, color: scenario.color }}>
                      {scenario.annualRate}% a.a.
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-400">{scenario.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-extrabold text-gray-900 dark:text-white">
                    {formatCurrency(scenario.finalBalance)}
                  </p>
                  <p className="text-xs text-gray-400">saldo final</p>
                </div>
              </div>

              {/* Mini barra de progresso */}
              <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min((scenario.totalInterest / scenario.finalBalance) * 100, 100)}%`,
                    backgroundColor: scenario.color,
                  }}
                />
              </div>

              <div className="flex justify-between text-xs text-gray-400">
                <span>Investido: {formatCurrency(scenario.totalInvested)}</span>
                <span>Juros: {formatCurrency(scenario.totalInterest)} (+{pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
