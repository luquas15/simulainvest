import { Link } from 'react-router-dom';

const TOOLS = [
  {
    to: '/calculadora-metas',
    emoji: '🎯',
    title: 'Calculadora de Metas',
    desc: 'Quanto guardar por mês para atingir seu objetivo?',
    tag: 'Popular',
    tagColor: 'bg-brand/10 text-brand',
    gradient: 'from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10',
  },
  {
    to: '/comparador-investimentos',
    emoji: '⚖️',
    title: 'Comparador de Investimentos',
    desc: 'CDB, LCI, Tesouro, FIIs e Ações — qual rende mais?',
    tag: 'Com IR',
    tagColor: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    gradient: 'from-purple-50 to-violet-50 dark:from-purple-900/10 dark:to-violet-900/10',
  },
  {
    to: '/simulador-aposentadoria',
    emoji: '🏖️',
    title: 'Simulador de Aposentadoria',
    desc: 'Você está no caminho certo para se aposentar?',
    tag: 'Novo',
    tagColor: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    gradient: 'from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10',
  },
  {
    to: '/calculadora-financiamento',
    emoji: '🏠',
    title: 'Calculadora de Financiamento',
    desc: 'Price vs SAC: quanto você paga de juros no total?',
    tag: 'Price & SAC',
    tagColor: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    gradient: 'from-red-50 to-rose-50 dark:from-red-900/10 dark:to-rose-900/10',
  },
  {
    to: '/calculadora-juros-compostos',
    emoji: '🧮',
    title: 'Calculadora de Juros Compostos',
    desc: 'Fórmula M = C(1+i)ⁿ explicada e calculada.',
    tag: 'SEO #1',
    tagColor: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    gradient: 'from-blue-50 to-sky-50 dark:from-blue-900/10 dark:to-sky-900/10',
  },
  {
    to: '/blog',
    emoji: '📚',
    title: 'Hub de Finanças',
    desc: 'Artigos, guias e todas as ferramentas em um lugar.',
    tag: 'Ver tudo',
    tagColor: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
    gradient: 'from-gray-50 to-slate-50 dark:from-gray-900/10 dark:to-slate-900/10',
  },
];

export default function ToolsHub() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-2xl font-extrabold text-gray-900 dark:text-white">
          Mais ferramentas gratuitas
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Tudo que você precisa para planejar suas finanças em um lugar só
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map(tool => (
          <Link
            key={tool.to}
            to={tool.to}
            className={`group rounded-2xl bg-gradient-to-br ${tool.gradient} border border-gray-100 p-6 transition-all hover:-translate-y-0.5 hover:shadow-card dark:border-gray-800`}
          >
            <div className="mb-3 flex items-start justify-between">
              <span className="text-3xl">{tool.emoji}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tool.tagColor}`}>
                {tool.tag}
              </span>
            </div>
            <h3 className="mb-1 font-semibold text-gray-900 transition-colors group-hover:text-brand dark:text-white">
              {tool.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{tool.desc}</p>

            <div className="mt-3 flex items-center gap-1 text-xs font-medium text-brand opacity-0 transition-opacity group-hover:opacity-100">
              Abrir ferramenta
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
