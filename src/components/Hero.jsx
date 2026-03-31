import { Link } from 'react-router-dom';

const STATS = [
  { value: '100%', label: 'Gratuito' },
  { value: '< 1s',  label: 'Resultado' },
  { value: '3',    label: 'Cenários' },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 py-20 text-white md:py-28">
      {/* Background decorative blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-brand/10 blur-3xl" />
        <div className="absolute -right-20 top-20 h-72 w-72 rounded-full bg-purple-500/8 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-brand/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-sm font-medium text-brand">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
          </span>
          Simulador gratuito e sem cadastro
        </div>

        {/* Headline */}
        <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
          Descubra quanto seu{' '}
          <span className="bg-gradient-to-r from-brand to-green-400 bg-clip-text text-transparent">
            dinheiro pode render
          </span>
        </h1>

        <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-400 sm:text-xl">
          Simule investimentos com juros compostos, compare cenários e tome decisões financeiras
          inteligentes — visualização instantânea, sem complicação.
        </p>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="#simulador"
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-8 py-4 text-base font-semibold text-white shadow-glow transition-all hover:bg-brand-dark hover:shadow-lg active:scale-95"
          >
            Simular Agora
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <Link
            to="/calculadora-juros-compostos"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-700 px-8 py-4 text-base font-medium text-gray-300 transition-all hover:border-gray-500 hover:text-white"
          >
            Ver Calculadora
          </Link>
        </div>

        {/* Mini stats */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-8">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-sm text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
