import { useState } from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { formatCurrency } from '../utils/finance';

// Constrói URL de compartilhamento com os parâmetros atuais
function buildShareUrl(params) {
  const base = window.location.origin + window.location.pathname;
  const p = new URLSearchParams({
    vi: params.initialValue,
    mc: params.monthlyContrib,
    rate: params.annualRate,
    rt: params.rateType,
    per: params.periods,
    pt: params.periodType,
    inf: params.inflationRate,
    ii: params.includeInflation ? '1' : '0',
  });
  return `${base}?${p.toString()}`;
}

// Texto do tweet
function buildShareText(summary, params) {
  if (!summary) return 'Simule seus investimentos em SimulaInvest!';
  const period = params.periodType === 'years'
    ? `${params.periods} anos`
    : `${params.periods} meses`;
  return `Simulei meu investimento no SimulaInvest 🚀\n\n💰 Investindo ${formatCurrency(params.initialValue)} + ${formatCurrency(params.monthlyContrib)}/mês por ${period}, acumulo ${formatCurrency(summary.finalBalance)}!\n\nSimule o seu:`;
}

const NETWORKS = [
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.12 1.529 5.855L.057 23.854l6.149-1.613A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.65-.51-5.17-1.4l-.371-.22-3.849 1.01 1.027-3.748-.242-.387A9.94 9.94 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
      </svg>
    ),
    color: 'bg-green-500 hover:bg-green-600',
    buildUrl: (text, url) =>
      `https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`,
  },
  {
    key: 'twitter',
    label: 'Twitter/X',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    color: 'bg-black hover:bg-gray-800',
    buildUrl: (text, url) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    color: 'bg-blue-600 hover:bg-blue-700',
    buildUrl: (text, url) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
];

export default function ShareButton() {
  const { params, summary } = useSimulator();
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const url = buildShareUrl(params);
  const text = buildShareText(summary, params);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback para browsers sem clipboard API
      const el = document.createElement('input');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-brand hover:text-brand dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Compartilhar Simulação
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-72 animate-fade-in rounded-2xl border border-gray-100 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-900">
          <p className="mb-3 text-xs font-semibold text-gray-500 dark:text-gray-400">
            Compartilhar resultado
          </p>

          {/* Redes sociais */}
          <div className="mb-3 grid grid-cols-3 gap-2">
            {NETWORKS.map(net => (
              <a
                key={net.key}
                href={net.buildUrl(text, url)}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex flex-col items-center gap-1 rounded-xl py-3 text-white transition-transform active:scale-95 ${net.color}`}
              >
                {net.icon}
                <span className="text-xs font-medium">{net.label}</span>
              </a>
            ))}
          </div>

          {/* Copiar link */}
          <div className="flex gap-2">
            <input
              readOnly
              value={url}
              className="flex-1 truncate rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
            />
            <button
              onClick={copyLink}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {copied ? '✓' : 'Copiar'}
            </button>
          </div>
        </div>
      )}

      {/* Overlay para fechar */}
      {open && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}
