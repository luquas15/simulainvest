import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { SimulatorProvider } from './context/SimulatorContext';
import { MarketDataProvider } from './context/MarketDataContext';
import Header from './components/Header';
import Footer from './components/Footer';
import MarketBanner from './components/MarketBanner';
import EmailCapture from './components/EmailCapture';

// Lazy load de páginas — cada rota vira um chunk separado
const Home                    = lazy(() => import('./pages/Home'));
const Calculadora             = lazy(() => import('./pages/Calculadora'));
const SimuladorInvestimento   = lazy(() => import('./pages/SimuladorInvestimento'));
const CalculadoraMetas        = lazy(() => import('./pages/CalculadoraMetas'));
const ComparadorInvestimentos = lazy(() => import('./pages/ComparadorInvestimentos'));
const SimuladorAposentadoria  = lazy(() => import('./pages/SimuladorAposentadoria'));
const CalculadoraFinanciamento= lazy(() => import('./pages/CalculadoraFinanciamento'));
const Blog                    = lazy(() => import('./pages/Blog'));
const MercadoAoVivo           = lazy(() => import('./pages/MercadoAoVivo'));
const SimuladorDividendos     = lazy(() => import('./pages/SimuladorDividendos'));
const CalculadoraAluguelCompra= lazy(() => import('./pages/CalculadoraAluguelCompra'));
const CalculadoraIRPF         = lazy(() => import('./pages/CalculadoraIRPF'));
const Privacidade             = lazy(() => import('./pages/Privacidade'));
const Termos                  = lazy(() => import('./pages/Termos'));

function PageLoader() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-brand" />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      {/* MarketDataProvider envolve tudo para que qualquer componente
          possa acessar as taxas ao vivo do Banco Central */}
      <MarketDataProvider>
        <SimulatorProvider>
          <BrowserRouter>
            <div className="flex min-h-screen flex-col bg-gray-50 font-sans dark:bg-gray-950">

              {/* Banner de taxas em tempo real — sempre visível */}
              <MarketBanner />

              <Header />

              <div className="flex-1">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/"                             element={<Home />} />
                    <Route path="/calculadora-juros-compostos"  element={<Calculadora />} />
                    <Route path="/simulador-investimento"       element={<SimuladorInvestimento />} />
                    <Route path="/calculadora-metas"            element={<CalculadoraMetas />} />
                    <Route path="/comparador-investimentos"     element={<ComparadorInvestimentos />} />
                    <Route path="/simulador-aposentadoria"      element={<SimuladorAposentadoria />} />
                    <Route path="/calculadora-financiamento"    element={<CalculadoraFinanciamento />} />
                    <Route path="/blog"                         element={<Blog />} />
                    <Route path="/mercado-ao-vivo"              element={<MercadoAoVivo />} />
                    <Route path="/simulador-dividendos"         element={<SimuladorDividendos />} />
                    <Route path="/aluguel-ou-compra"            element={<CalculadoraAluguelCompra />} />
                    <Route path="/calculadora-irpf"             element={<CalculadoraIRPF />} />
                    <Route path="/privacidade"                  element={<Privacidade />} />
                    <Route path="/termos"                       element={<Termos />} />
                  </Routes>
                </Suspense>
              </div>

              <Footer />

              {/* Modal de captura de e-mail após 45s */}
              <EmailCapture />
            </div>
          </BrowserRouter>
        </SimulatorProvider>
      </MarketDataProvider>
    </ThemeProvider>
  );
}
