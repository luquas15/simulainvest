import Hero from '../components/Hero';
import SimulatorForm from '../components/SimulatorForm';
import ResultsSummary from '../components/ResultsSummary';
import InvestmentChart from '../components/InvestmentChart';
import ComparisonTable from '../components/ComparisonTable';
import Insights from '../components/Insights';
import TimelineTable from '../components/TimelineTable';
import ShareButton from '../components/ShareButton';
import ShareCard from '../components/ShareCard';
import ToolsHub from '../components/ToolsHub';

export default function Home() {
  return (
    <>
      <Hero />

      <main id="simulador" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[380px_1fr]">
          {/* Coluna esquerda — formulário */}
          <div className="space-y-6">
            <SimulatorForm />

            {/* Ad placeholder */}
            <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 text-xs text-gray-400 dark:border-gray-700 dark:bg-gray-900">
              📢 Google Ads
            </div>
          </div>

          {/* Coluna direita — resultados */}
          <div className="space-y-6">
            <ResultsSummary />
            <InvestmentChart />
            <Insights />

            {/* Ações de compartilhamento */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-gray-400">Compartilhe ou salve seu resultado</p>
              <div className="flex gap-2">
                <ShareCard />
                <ShareButton />
              </div>
            </div>
          </div>
        </div>

        {/* Linha do tempo */}
        <div className="mt-10">
          <TimelineTable />
        </div>

        {/* Comparação */}
        <div className="mt-8">
          <ComparisonTable />
        </div>

        {/* Hub de ferramentas */}
        <div className="mt-8 -mx-4 sm:-mx-6">
          <ToolsHub />
        </div>

        {/* Conteúdo SEO */}
        <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            O que é juros compostos e por que importa?
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            <p>
              <strong>Juros compostos</strong> são o fenômeno financeiro onde os juros gerados em um período
              passam a render juros nos períodos seguintes. Albert Einstein teria chamado os juros compostos
              de "a oitava maravilha do mundo" — quem entende ganha, quem não entende paga.
            </p>
            <p>
              A fórmula básica é: <strong className="font-mono text-brand">M = C × (1 + i)^n</strong>, onde M é o montante final,
              C é o capital inicial, i é a taxa de juros por período e n é o número de períodos.
            </p>
            <p>
              Com o <strong>SimulaInvest</strong>, você visualiza instantaneamente o impacto de diferentes
              taxas de retorno, aportes mensais e prazos — permitindo tomar decisões mais inteligentes
              antes de investir seu dinheiro.
            </p>
          </div>
        </section>

        {/* FAQ SEO */}
        <section className="mt-8">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
            Perguntas Frequentes
          </h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map(({ q, a }) => (
              <details key={q} className="group rounded-xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                <summary className="cursor-pointer list-none font-medium text-gray-900 dark:text-white">{q}</summary>
                <p className="mt-3 text-sm leading-relaxed text-gray-500 dark:text-gray-400">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

const FAQ_ITEMS = [
  {
    q: 'Quanto rende R$ 1.000 reais investidos?',
    a: 'Depende da taxa de retorno e do prazo. Com juros compostos de 1% ao mês, R$ 1.000 viram R$ 1.127 em 12 meses, R$ 3.300 em 10 anos e mais de R$ 10.000 em 20 anos — sem nenhum aporte adicional. Use o simulador acima para ver o cálculo exato.',
  },
  {
    q: 'Qual a diferença entre juros simples e juros compostos?',
    a: 'Nos juros simples, os juros são sempre calculados sobre o capital inicial. Nos juros compostos, os juros de um período são somados ao capital e passam a render também — criando um efeito exponencial de crescimento.',
  },
  {
    q: 'Como calcular a rentabilidade de um investimento?',
    a: 'Use a fórmula M = C × (1 + i)^n, onde M é o valor final, C é o capital inicial, i é a taxa por período e n é o número de períodos. Ou simplesmente use nosso simulador e obtenha o resultado instantaneamente.',
  },
  {
    q: 'O simulador é gratuito?',
    a: 'Sim! O SimulaInvest é 100% gratuito, sem cadastro e sem limites de simulação. Todos os cálculos são feitos diretamente no seu navegador.',
  },
  {
    q: 'Como comparar CDB, LCI e Tesouro Direto?',
    a: 'Use nossa ferramenta de Comparador de Investimentos — ela calcula o rendimento líquido de cada produto já com o desconto de IR, permitindo uma comparação justa entre ativos com e sem isenção fiscal.',
  },
];
