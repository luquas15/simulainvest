import { useSimulator } from '../context/SimulatorContext';

export default function Insights() {
  const { insights } = useSimulator();

  if (!insights.length) return null;

  return (
    <div className="rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/5 to-green-50/50 p-6 dark:border-brand/20 dark:from-brand/5 dark:to-gray-900">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
        <span className="text-xl">💡</span>
        Insights Personalizados
      </h2>

      <div className="space-y-3">
        {insights.map((insight, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-xl bg-white/70 p-4 backdrop-blur-sm dark:bg-gray-800/50"
          >
            <span className="mt-0.5 text-lg leading-none">{insight.icon}</span>
            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {insight.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
