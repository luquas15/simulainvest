import { Link } from 'react-router-dom';

const ARTICLES = [
  {
    slug: 'quanto-rende-1000-reais',
    title: 'Quanto rende R$ 1.000 reais investidos em 2026?',
    excerpt: 'Calculamos quanto rendem R$ 1.000 em poupança, CDB, Tesouro Direto e ações. Os resultados vão te surpreender.',
    tag: 'Simulações',
    tagColor: 'bg-brand/10 text-brand',
    readTime: '3 min',
    tool: '/',
    toolLabel: 'Simular agora',
    emoji: '💰',
  },
  {
    slug: 'juros-compostos-explicados',
    title: 'Juros compostos: o segredo dos ricos explicado de forma simples',
    excerpt: 'Entenda de uma vez por todas como os juros compostos funcionam e por que investir cedo faz tanta diferença.',
    tag: 'Educação',
    tagColor: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    readTime: '5 min',
    tool: '/calculadora-juros-compostos',
    toolLabel: 'Calcular',
    emoji: '📈',
  },
  {
    slug: 'cdb-vs-lci-qual-melhor',
    title: 'CDB vs LCI: qual rende mais? A comparação definitiva',
    excerpt: 'A resposta depende do prazo e da taxa. Fizemos as contas para você — com IR e tudo.',
    tag: 'Comparativo',
    tagColor: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    readTime: '4 min',
    tool: '/comparador-investimentos',
    toolLabel: 'Comparar',
    emoji: '⚖️',
  },
  {
    slug: 'aposentadoria-quanto-guardar',
    title: 'Quanto guardar por mês para se aposentar bem?',
    excerpt: 'Simulamos 3 perfis de renda e mostramos exatamente quanto cada um precisa guardar todo mês.',
    tag: 'Aposentadoria',
    tagColor: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    readTime: '6 min',
    tool: '/simulador-aposentadoria',
    toolLabel: 'Simular aposentadoria',
    emoji: '🏖️',
  },
  {
    slug: 'financiamento-imobiliario-vale-a-pena',
    title: 'Financiamento imobiliário: quanto você realmente paga de juros?',
    excerpt: 'Um imóvel de R$ 400.000 pode custar R$ 900.000 no final. Veja o cálculo e saiba o que fazer.',
    tag: 'Financiamento',
    tagColor: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    readTime: '5 min',
    tool: '/calculadora-financiamento',
    toolLabel: 'Simular financiamento',
    emoji: '🏠',
  },
  {
    slug: 'regra-dos-50-30-20',
    title: 'Regra 50/30/20: o orçamento pessoal mais simples do mundo',
    excerpt: 'Como dividir seu salário entre necessidades, desejos e investimentos — e como automatizar isso.',
    tag: 'Finanças Pessoais',
    tagColor: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    readTime: '4 min',
    tool: '/calculadora-metas',
    toolLabel: 'Definir minha meta',
    emoji: '📊',
  },
];

const TOOLS = [
  { to: '/',                            label: 'Simulador de Investimento',     emoji: '📊', desc: 'Juros compostos com gráfico interativo' },
  { to: '/calculadora-juros-compostos', label: 'Calculadora de Juros Compostos',emoji: '🧮', desc: 'Fórmula M = C(1+i)ⁿ em segundos' },
  { to: '/simulador-investimento',      label: 'Simulador Financeiro',           emoji: '📈', desc: 'Compare cenários conservador e agressivo' },
  { to: '/calculadora-metas',           label: 'Calculadora de Metas',           emoji: '🎯', desc: 'Quanto guardar para atingir seu objetivo' },
  { to: '/comparador-investimentos',    label: 'Comparador de Investimentos',    emoji: '⚖️', desc: 'CDB, LCI, Tesouro, FIIs, BTC e mais' },
  { to: '/simulador-aposentadoria',     label: 'Simulador de Aposentadoria',     emoji: '🏖️', desc: 'Planeje sua independência financeira' },
  { to: '/calculadora-financiamento',   label: 'Calculadora de Financiamento',   emoji: '🏠', desc: 'Price vs SAC, parcelas e juros totais' },
  { to: '/simulador-dividendos',        label: 'Simulador de Dividendos',        emoji: '💰', desc: 'Quando você atinge sua renda passiva?' },
  { to: '/aluguel-ou-compra',           label: 'Alugar ou Comprar Imóvel?',      emoji: '🏡', desc: 'Compare patrimônio líquido de cada opção' },
  { to: '/calculadora-irpf',            label: 'Calculadora de IRPF',            emoji: '📋', desc: 'Completo vs simplificado — qual paga menos?' },
  { to: '/mercado-ao-vivo',             label: 'Mercado ao Vivo',                emoji: '📡', desc: 'Gráficos de candlestick em tempo real' },
];

export default function Blog() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="mb-3 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
          Hub de Finanças SimulaInvest
        </h1>
        <p className="mx-auto max-w-2xl text-gray-500 dark:text-gray-400">
          Ferramentas gratuitas, artigos e simulações para você tomar decisões financeiras mais inteligentes.
        </p>
      </div>

      {/* Grid de Ferramentas */}
      <section className="mb-14">
        <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
          Calculadoras e Simuladores
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {TOOLS.map(tool => (
            <Link
              key={tool.to}
              to={tool.to}
              className="group rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-card dark:border-gray-800 dark:bg-gray-900"
            >
              <span className="mb-3 block text-2xl">{tool.emoji}</span>
              <h3 className="mb-1 font-semibold text-gray-900 transition-colors group-hover:text-brand dark:text-white">
                {tool.label}
              </h3>
              <p className="text-xs text-gray-400">{tool.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Artigos */}
      <section>
        <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
          Artigos e Guias
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ARTICLES.map(article => (
            <article
              key={article.slug}
              className="group flex flex-col rounded-2xl border border-gray-100 bg-white transition-all hover:-translate-y-0.5 hover:shadow-card dark:border-gray-800 dark:bg-gray-900"
            >
              {/* Card visual */}
              <div className="flex h-28 items-center justify-center rounded-t-2xl bg-gradient-to-br from-gray-50 to-gray-100 text-5xl dark:from-gray-800 dark:to-gray-900">
                {article.emoji}
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${article.tagColor}`}>
                    {article.tag}
                  </span>
                  <span className="text-xs text-gray-400">{article.readTime} de leitura</span>
                </div>

                <h3 className="mb-2 font-semibold leading-snug text-gray-900 transition-colors group-hover:text-brand dark:text-white">
                  {article.title}
                </h3>
                <p className="mb-4 flex-1 text-sm text-gray-500 dark:text-gray-400">
                  {article.excerpt}
                </p>

                <Link
                  to={article.tool}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-colors hover:text-brand-dark"
                >
                  {article.toolLabel}
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SEO Footer text */}
      <section className="mt-14 rounded-2xl border border-gray-100 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          Por que usar o SimulaInvest?
        </h2>
        <div className="grid gap-6 text-sm text-gray-500 dark:text-gray-400 sm:grid-cols-3">
          {[
            { icon: '⚡', title: 'Instantâneo', desc: 'Todos os cálculos rodam no seu navegador — sem servidor, sem espera.' },
            { icon: '🔒', title: 'Privado',     desc: 'Seus dados nunca saem do seu dispositivo. Sem cadastro, sem rastreamento.' },
            { icon: '🆓', title: 'Gratuito',    desc: 'Todas as ferramentas são 100% gratuitas e sem anúncios invasivos.' },
          ].map(({ icon, title, desc }) => (
            <div key={title}>
              <p className="mb-1 text-lg">{icon}</p>
              <p className="mb-1 font-semibold text-gray-900 dark:text-white">{title}</p>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
