import { useState, useEffect } from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { formatCurrency } from '../utils/finance';

const STORAGE_KEY = 'simulainvest-email-dismissed';
const DELAY_MS = 45000; // aparece após 45s

export default function EmailCapture() {
  const { summary } = useSimulator();
  const [visible, setVisible] = useState(false);
  const [email,   setEmail]   = useState('');
  const [status,  setStatus]  = useState('idle'); // 'idle' | 'success' | 'error'

  useEffect(() => {
    // Não mostra se já foi dispensado
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) return;

    const timer = setTimeout(() => setVisible(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, '1');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      return;
    }

    // Aqui integraria com Mailchimp/ConvertKit/EmailJS
    // Por ora, salva localmente como demo
    try {
      const leads = JSON.parse(localStorage.getItem('simulainvest-leads') || '[]');
      leads.push({ email, date: new Date().toISOString(), simulation: summary });
      localStorage.setItem('simulainvest-leads', JSON.stringify(leads));
      setStatus('success');
      setTimeout(dismiss, 3000);
    } catch {
      setStatus('error');
    }
  };

  if (!visible) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Modal */}
      <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-lg animate-slide-up rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2">
        {/* Fechar */}
        <button
          onClick={dismiss}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          aria-label="Fechar"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {status === 'success' ? (
          <div className="py-4 text-center">
            <div className="mb-3 text-4xl">🎉</div>
            <h3 className="mb-1 text-lg font-bold text-gray-900 dark:text-white">E-mail confirmado!</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Você receberá sua simulação e dicas exclusivas em breve.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-start gap-3">
              <span className="mt-0.5 text-2xl">📊</span>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  Receba sua simulação por e-mail
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {summary
                    ? `Você projetou ${formatCurrency(summary.finalBalance)} — salve esse resultado e receba dicas para potencializar ainda mais.`
                    : 'Salve sua simulação e receba dicas personalizadas para investir melhor.'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-900 outline-none transition-all focus:ring-2 dark:bg-gray-800 dark:text-white ${
                  status === 'error'
                    ? 'border-red-300 focus:ring-red-200'
                    : 'border-gray-200 focus:border-brand focus:ring-brand/20 dark:border-gray-700'
                }`}
              />
              {status === 'error' && (
                <p className="text-xs text-red-500">Digite um e-mail válido.</p>
              )}
              <button
                type="submit"
                className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white shadow-glow transition-all hover:bg-brand-dark active:scale-[.98]"
              >
                Enviar simulação para meu e-mail →
              </button>
            </form>

            <p className="mt-3 text-center text-xs text-gray-400">
              Sem spam. Cancele quando quiser. Gratuito.
            </p>
          </>
        )}
      </div>
    </>
  );
}
