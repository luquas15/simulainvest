import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const NAV_PRIMARY = [
  { to: '/',                            label: 'Simulador' },
  { to: '/mercado-ao-vivo',             label: 'Mercado ao Vivo' },
  { to: '/comparador-investimentos',    label: 'Comparador' },
  { to: '/blog',                        label: 'Ferramentas' },
];

const NAV_TOOLS = [
  { to: '/',                             label: '📊 Simulador de Investimento' },
  { to: '/calculadora-juros-compostos',  label: '🧮 Calculadora Juros Compostos' },
  { to: '/simulador-investimento',       label: '📈 Simulador Financeiro' },
  { to: '/calculadora-metas',            label: '🎯 Calculadora de Metas' },
  { to: '/comparador-investimentos',     label: '⚖️ Comparador de Investimentos' },
  { to: '/simulador-aposentadoria',      label: '🏖️ Simulador de Aposentadoria' },
  { to: '/calculadora-financiamento',    label: '🏠 Calculadora de Financiamento' },
  { to: '/simulador-dividendos',         label: '💰 Simulador de Dividendos' },
  { to: '/aluguel-ou-compra',            label: '🏡 Alugar ou Comprar?' },
  { to: '/calculadora-irpf',             label: '📋 Calculadora de IRPF' },
  { to: '/mercado-ao-vivo',             label: '📡 Mercado ao Vivo' },
];

export default function Header() {
  const { isDark, toggle } = useTheme();
  const { pathname } = useLocation();
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [toolsOpen,    setToolsOpen]    = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-black text-white shadow-glow">S</span>
          <span className="text-lg">Simula<span className="text-brand">Invest</span></span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_PRIMARY.map(({ to, label }) => (
            label === 'Ferramentas' ? (
              // Dropdown de ferramentas
              <div key={to} className="relative">
                <button
                  onClick={() => setToolsOpen(o => !o)}
                  className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white ${
                    toolsOpen ? 'text-brand' : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {label}
                  <svg className={`h-3.5 w-3.5 transition-transform ${toolsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {toolsOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setToolsOpen(false)} />
                    <div className="absolute right-0 top-full z-20 mt-1 w-64 animate-fade-in rounded-xl border border-gray-100 bg-white py-1 shadow-xl dark:border-gray-700 dark:bg-gray-900">
                      {NAV_TOOLS.map(t => (
                        <Link key={t.to} to={t.to}
                          onClick={() => setToolsOpen(false)}
                          className={`block px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 hover:text-brand dark:hover:bg-gray-800 ${
                            pathname === t.to ? 'text-brand' : 'text-gray-700 dark:text-gray-300'
                          }`}>
                          {t.label}
                        </Link>
                      ))}
                      <div className="mx-4 my-1 border-t border-gray-100 dark:border-gray-700" />
                      <Link to="/blog" onClick={() => setToolsOpen(false)}
                        className="block px-4 py-2.5 text-sm font-medium text-brand hover:bg-gray-50 dark:hover:bg-gray-800">
                        📚 Ver hub completo →
                      </Link>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link key={to} to={to}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white ${
                  pathname === to ? 'text-brand' : 'text-gray-600 dark:text-gray-400'
                }`}>
                {label}
              </Link>
            )
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button onClick={toggle} aria-label="Alternar tema"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white">
            {isDark ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Mobile menu */}
          <button onClick={() => setMenuOpen(o => !o)} aria-label="Menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 md:hidden dark:text-gray-400 dark:hover:bg-gray-800">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <nav className="border-t border-gray-100 bg-white px-4 pb-4 pt-2 dark:border-gray-800 dark:bg-gray-950 md:hidden">
          {NAV_TOOLS.map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)}
              className={`block py-2 text-sm font-medium transition-colors hover:text-brand ${
                pathname === to ? 'text-brand' : 'text-gray-600 dark:text-gray-400'
              }`}>
              {label}
            </Link>
          ))}
          <Link to="/blog" onClick={() => setMenuOpen(false)}
            className="mt-2 block border-t border-gray-100 pt-2 text-sm font-semibold text-brand dark:border-gray-700">
            📚 Hub de Finanças
          </Link>
        </nav>
      )}
    </header>
  );
}
