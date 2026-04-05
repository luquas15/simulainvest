import SimulatorForm from '../components/SimulatorForm';
import ResultsSummary from '../components/ResultsSummary';
import ComparisonTable from '../components/ComparisonTable';
import InvestmentChart from '../components/InvestmentChart';
import Insights from '../components/Insights';
import ShareButton from '../components/ShareButton';
import AdUnit, { AD_SLOTS } from '../components/AdUnit';
import { usePageTitle } from '../hooks/usePageTitle';

// Página dedicada para SEO: /simulador-investimento
export default function SimuladorInvestimento() {
  usePageTitle('Simulador de Investimento Financeiro');
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-10 text-center">
        <h1 className="mb-3 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
          Simulador de Investimento
        </h1>
        <p className="mx-auto max-w-2xl text-gray-500 dark:text-gray-400">
          Compare cenários conservador, moderado e agressivo. Descubra qual estratégia de investimento
          pode te ajudar a atingir seus objetivos financeiros mais rapidamente.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[380px_1fr]">
        <SimulatorForm />
        <div className="space-y-6">
          <ResultsSummary />
          <InvestmentChart />
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <ComparisonTable />
        <Insights />
        <div className="flex justify-end">
          <ShareButton />
        </div>
      </div>

      <AdUnit slot={AD_SLOTS.HORIZONTAL} className="mt-8" />

      {/* Conteúdo informativo para SEO */}
      <section className="mt-12 rounded-2xl border border-gray-100 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
          Entendendo os Perfis de Investidor
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              type: 'Conservador',
              color: '#3B82F6',
              desc: 'Prioriza segurança e previsibilidade. Investe em renda fixa como Tesouro Direto, CDB e LCI/LCA. Retorno médio de 8–12% ao ano.',
              examples: ['Tesouro Direto', 'CDB', 'LCI/LCA', 'Poupança Plus'],
            },
            {
              type: 'Moderado',
              color: '#8B5CF6',
              desc: 'Equilibra segurança e crescimento. Mescla renda fixa com renda variável. Retorno médio de 12–18% ao ano, com volatilidade moderada.',
              examples: ['Fundos Multimercado', 'Debêntures', 'FIIs', 'ETFs de RF'],
            },
            {
              type: 'Agressivo',
              color: '#00D46A',
              desc: 'Foca em crescimento máximo aceitando maior volatilidade. Concentrado em renda variável. Potencial de 18–30%+ ao ano no longo prazo.',
              examples: ['Ações', 'ETFs de ações', 'FIIs', 'BDRs'],
            },
          ].map(({ type, color, desc, examples }) => (
            <div key={type} className="rounded-xl border border-gray-100 p-5 dark:border-gray-700">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                <h3 className="font-semibold text-gray-900 dark:text-white">{type}</h3>
              </div>
              <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">{desc}</p>
              <div className="flex flex-wrap gap-1">
                {examples.map(ex => (
                  <span
                    key={ex}
                    className="rounded-md px-2 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: `${color}15`, color }}
                  >
                    {ex}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
