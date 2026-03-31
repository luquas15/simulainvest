import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { useSimulator } from '../context/SimulatorContext';
import { formatCurrency } from '../utils/finance';

// Card visual que será capturado como imagem
function CardPreview({ summary, params }) {
  if (!summary) return null;

  const period = params.periodType === 'years'
    ? `${params.periods} anos`
    : `${params.periods} meses`;

  return (
    <div
      style={{
        width: 600,
        height: 315,
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        fontFamily: 'Inter, system-ui, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '36px 40px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background blob */}
      <div style={{
        position: 'absolute', top: -60, right: -60,
        width: 220, height: 220, borderRadius: '50%',
        background: 'rgba(0,212,106,0.12)',
        filter: 'blur(40px)',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: '#00D46A', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 16, fontWeight: 900, color: '#fff',
        }}>S</div>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>
          Simula<span style={{ color: '#00D46A' }}>Invest</span>
        </span>
      </div>

      {/* Main content */}
      <div>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
          Simulação de {period}
        </p>
        <p style={{ color: '#fff', fontSize: 42, fontWeight: 800, lineHeight: 1.1 }}>
          {formatCurrency(summary.finalBalance)}
        </p>
        <p style={{ color: '#00D46A', fontSize: 14, marginTop: 8 }}>
          Saldo final acumulado
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 32 }}>
        {[
          { label: 'Total investido', value: formatCurrency(summary.totalInvested) },
          { label: 'Juros ganhos',    value: formatCurrency(summary.totalInterest) },
          { label: 'Retorno',         value: `+${((summary.totalInterest / summary.totalInvested) * 100).toFixed(1)}%` },
        ].map(({ label, value }) => (
          <div key={label}>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: 3 }}>{label}</p>
            <p style={{ color: '#fff', fontSize: 15, fontWeight: 600 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, textAlign: 'right' }}>
        simulainvest.com.br
      </p>
    </div>
  );
}

export default function ShareCard() {
  const { summary, params } = useSimulator();
  const cardRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const downloadCard = async () => {
    if (!cardRef.current) return;
    setLoading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = 'simulainvest-resultado.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Erro ao gerar imagem', err);
    } finally {
      setLoading(false);
    }
  };

  if (!summary) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-brand hover:text-brand dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Gerar Card de Resultado
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="fixed inset-4 z-50 flex items-center justify-center">
            <div className="w-full max-w-2xl animate-fade-in rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 dark:text-white">Card para compartilhar</h3>
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Preview do card */}
              <div className="mb-4 overflow-hidden rounded-xl">
                <div ref={cardRef}>
                  <CardPreview summary={summary} params={params} />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={downloadCard}
                  disabled={loading}
                  className="flex-1 rounded-xl bg-brand py-3 text-sm font-semibold text-white shadow-glow transition-all hover:bg-brand-dark disabled:opacity-60 active:scale-[.98]"
                >
                  {loading ? 'Gerando...' : '⬇️ Baixar como PNG'}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-gray-200 px-5 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400"
                >
                  Fechar
                </button>
              </div>
              <p className="mt-2 text-center text-xs text-gray-400">
                Compartilhe no WhatsApp, Instagram Stories ou LinkedIn
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
