import { Link } from 'react-router-dom';

const TOOLS = [
  { to: '/',                            label: 'Simulador de Investimento' },
  { to: '/calculadora-juros-compostos', label: 'Calculadora de Juros Compostos' },
  { to: '/calculadora-metas',           label: 'Calculadora de Metas' },
  { to: '/comparador-investimentos',    label: 'Comparador de Investimentos' },
  { to: '/simulador-aposentadoria',     label: 'Simulador de Aposentadoria' },
  { to: '/calculadora-financiamento',   label: 'Calculadora de Financiamento' },
];

const COMING_SOON = [
  'Simulador de Dividendos',
  'Comparador de Fundos',
  'Calculadora de IRPF',
  'Simulador de Portfólio',
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-3 flex items-center gap-2 font-bold text-gray-900 dark:text-white">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-xs font-black text-white">S</span>
              Simula<span className="text-brand">Invest</span>
            </div>
            <p className="mb-4 max-w-xs text-sm text-gray-500 dark:text-gray-400">
              O hub completo de ferramentas financeiras gratuitas do Brasil.
              Simulações client-side — seus dados ficam no seu dispositivo.
            </p>
            <div className="flex flex-wrap gap-2">
              {['Gratuito', 'Sem cadastro', 'Privado', 'Open Source'].map(b => (
                <span key={b} className="rounded-full border border-gray-200 px-2.5 py-0.5 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Ferramentas */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Calculadoras</h3>
            <ul className="space-y-2">
              {TOOLS.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-gray-500 transition-colors hover:text-brand dark:text-gray-400">
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/blog" className="text-sm font-medium text-brand">
                  Ver todas →
                </Link>
              </li>
            </ul>
          </div>

          {/* Em breve */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Em Breve</h3>
            <ul className="space-y-2">
              {COMING_SOON.map(label => (
                <li key={label} className="flex items-center gap-1.5 text-sm text-gray-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-100 pt-6 dark:border-gray-800">
          <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} SimulaInvest. Fins educacionais — não constitui recomendação de investimento.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/privacidade" className="text-xs text-gray-400 hover:text-brand transition-colors">Privacidade</Link>
              <Link to="/termos"      className="text-xs text-gray-400 hover:text-brand transition-colors">Termos de Uso</Link>
              <p className="text-xs text-gray-400">Feito com ❤️ no Brasil</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
