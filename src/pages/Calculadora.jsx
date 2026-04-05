import SimulatorForm from '../components/SimulatorForm';
import ResultsSummary from '../components/ResultsSummary';
import InvestmentChart from '../components/InvestmentChart';
import TimelineTable from '../components/TimelineTable';
import ShareButton from '../components/ShareButton';
import Insights from '../components/Insights';
import SimulationHistory from '../components/SimulationHistory';
import AdUnit, { AD_SLOTS } from '../components/AdUnit';
import { usePageTitle } from '../hooks/usePageTitle';

// Página dedicada para SEO: /calculadora-juros-compostos
export default function Calculadora() {
  usePageTitle('Calculadora de Juros Compostos');
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      {/* SEO Header */}
      <div className="mb-10 text-center">
        <h1 className="mb-3 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
          Calculadora de Juros Compostos
        </h1>
        <p className="mx-auto max-w-2xl text-gray-500 dark:text-gray-400">
          Calcule o crescimento do seu dinheiro com juros compostos. Insira os valores abaixo
          e veja o resultado instantaneamente — mês a mês, com gráfico interativo.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[380px_1fr]">
        <SimulatorForm />
        <div className="space-y-6">
          <ResultsSummary />
          <InvestmentChart />
          <Insights />
          <div className="flex justify-end">
            <ShareButton />
          </div>
          <SimulationHistory />
        </div>
      </div>

      <AdUnit slot={AD_SLOTS.HORIZONTAL} className="mt-8" />

      <div className="mt-10">
        <TimelineTable />
      </div>

      {/* Conteúdo SEO detalhado */}
      <section className="mt-12 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Como usar a Calculadora de Juros Compostos
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { step: '1', title: 'Informe o capital', desc: 'Digite o valor inicial que você já tem ou pretende investir.' },
            { step: '2', title: 'Defina o aporte', desc: 'Adicione um valor de contribuição mensal para potencializar o crescimento.' },
            { step: '3', title: 'Veja o resultado', desc: 'O simulador calcula instantaneamente seu patrimônio mês a mês com juros compostos.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
                {step}
              </div>
              <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            Fórmula dos Juros Compostos
          </h2>
          <div className="mb-4 rounded-xl bg-gray-50 p-4 font-mono text-lg text-center text-gray-800 dark:bg-gray-800 dark:text-gray-200">
            M = C × (1 + i)^n
          </div>
          <div className="grid gap-3 text-sm text-gray-600 dark:text-gray-400 sm:grid-cols-2">
            <div><strong>M</strong> — Montante final acumulado</div>
            <div><strong>C</strong> — Capital inicial (valor investido)</div>
            <div><strong>i</strong> — Taxa de juros por período</div>
            <div><strong>n</strong> — Número de períodos</div>
          </div>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Quando há aportes mensais, o cálculo é feito iterativamente: a cada mês, aplicamos
            os juros ao saldo atual e somamos o aporte — resultando no efeito exponencial dos juros compostos.
          </p>
        </div>
      </section>
    </main>
  );
}
