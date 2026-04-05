import { Link } from 'react-router-dom';

const SUGGESTIONS = [
  { to: '/',                            label: 'Simulador de Investimento',   emoji: '📊' },
  { to: '/mercado-ao-vivo',             label: 'Mercado ao Vivo',             emoji: '📡' },
  { to: '/comparador-investimentos',    label: 'Comparador de Investimentos', emoji: '⚖️' },
  { to: '/calculadora-irpf',            label: 'Calculadora de IRPF',         emoji: '📋' },
];

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-20 text-center">
      <p className="mb-2 text-7xl font-black text-brand">404</p>
      <h1 className="mb-3 text-2xl font-extrabold text-gray-900 dark:text-white sm:text-3xl">
        Página não encontrada
      </h1>
      <p className="mb-10 max-w-md text-gray-500 dark:text-gray-400">
        O endereço que você digitou não existe ou foi movido. Explore nossas ferramentas gratuitas:
      </p>

      <div className="grid w-full max-w-lg gap-3 sm:grid-cols-2">
        {SUGGESTIONS.map(s => (
          <Link
            key={s.to}
            to={s.to}
            className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-4 text-left transition-all hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-card dark:border-gray-800 dark:bg-gray-900"
          >
            <span className="text-2xl">{s.emoji}</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{s.label}</span>
          </Link>
        ))}
      </div>

      <Link
        to="/blog"
        className="mt-8 text-sm font-medium text-brand hover:underline"
      >
        Ver todas as ferramentas →
      </Link>
    </main>
  );
}
