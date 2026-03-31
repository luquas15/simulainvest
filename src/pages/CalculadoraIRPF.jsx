import { useState, useMemo } from 'react';
import { calcIRPF, DEDUCAO_DEPENDENTE, LIMITE_EDUCACAO, LIMITE_SIMPLIFICADO } from '../utils/irpf';

// ─── helpers ────────────────────────────────────────────────────────────────

function fmt(value) {
  return Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtPct(value) {
  return (value * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
}

// ─── sub-components ─────────────────────────────────────────────────────────

function CurrencyInput({ label, id, value, onChange, hint }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="relative mt-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">R$</span>
        <input
          id={id}
          type="number"
          min={0}
          value={value}
          onChange={e => onChange(Number(e.target.value) || 0)}
          className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 py-2.5 text-sm focus:border-brand focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </div>
      {hint && <p className="mt-0.5 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function DependentStepper({ value, onChange }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Número de dependentes
      </label>
      <div className="mt-1 flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-lg font-bold text-gray-600 transition hover:border-brand hover:text-brand dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          aria-label="Diminuir dependentes"
        >
          −
        </button>
        <span className="min-w-[2rem] text-center text-lg font-bold text-gray-900 dark:text-white">
          {value}
        </span>
        <button
          onClick={() => onChange(Math.min(10, value + 1))}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-lg font-bold text-gray-600 transition hover:border-brand hover:text-brand dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          aria-label="Aumentar dependentes"
        >
          +
        </button>
        <span className="text-sm text-gray-400">
          {value > 0 && `Dedução: R$ ${fmt(value * DEDUCAO_DEPENDENTE)}`}
        </span>
      </div>
      <p className="mt-0.5 text-xs text-gray-400">
        Dedução por dependente: R$ {fmt(DEDUCAO_DEPENDENTE)}/ano
      </p>
    </div>
  );
}

// Tax bracket bar visualization
const FAIXAS_VIZ = [
  { label: 'Isento',  limite: 27110.40,  cor: 'bg-emerald-400', textCor: 'text-emerald-700 dark:text-emerald-400', aliq: '0%'    },
  { label: '7,5%',    limite: 33919.80,  cor: 'bg-sky-400',     textCor: 'text-sky-700 dark:text-sky-400',         aliq: '7,5%'  },
  { label: '15%',     limite: 45012.60,  cor: 'bg-yellow-400',  textCor: 'text-yellow-700 dark:text-yellow-400',   aliq: '15%'   },
  { label: '22,5%',   limite: 55976.16,  cor: 'bg-orange-400',  textCor: 'text-orange-700 dark:text-orange-400',   aliq: '22,5%' },
  { label: '27,5%',   limite: Infinity,  cor: 'bg-red-400',     textCor: 'text-red-700 dark:text-red-400',         aliq: '27,5%' },
];

function BracketViz({ base }) {
  const MAX_VIZ = 70000; // cap visual axis at 70k for proportional bars
  const userFaixaIdx = FAIXAS_VIZ.findIndex(f => base <= f.limite);

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
        Faixa de tributação — Base de cálculo: R$ {fmt(base)}
      </h3>
      <div className="space-y-2">
        {FAIXAS_VIZ.map((f, i) => {
          const prev  = i === 0 ? 0 : FAIXAS_VIZ[i - 1].limite;
          const atual = Math.min(f.limite, MAX_VIZ);
          const width = Math.round(((atual - prev) / MAX_VIZ) * 100);
          const isActive = i === userFaixaIdx;

          return (
            <div key={f.label} className="flex items-center gap-3">
              {/* bar */}
              <div className="relative flex-1 h-5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-visible">
                <div
                  className={`h-full rounded-full transition-all ${f.cor} ${isActive ? 'ring-2 ring-offset-1 ring-gray-700 dark:ring-white' : 'opacity-60'}`}
                  style={{ width: `${Math.max(width, 4)}%` }}
                />
                {isActive && (
                  <span
                    className="absolute -top-0.5 flex items-center justify-center"
                    style={{ left: `${Math.min(Math.max(width, 4), 96)}%`, transform: 'translateX(-50%)' }}
                  >
                    <span className="inline-block h-5 w-2 rounded-sm bg-gray-800 dark:bg-white shadow" title="Sua posição" />
                  </span>
                )}
              </div>
              {/* label */}
              <div className="w-32 flex items-center gap-1.5 shrink-0">
                <span className={`text-xs font-semibold ${isActive ? f.textCor : 'text-gray-400 dark:text-gray-500'}`}>
                  {f.aliq}
                </span>
                {isActive && (
                  <span className="rounded bg-gray-800 px-1.5 py-0.5 text-[10px] font-bold text-white dark:bg-white dark:text-gray-900">
                    ← você
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-gray-400">
        <span>R$ 0</span>
        <span>R$ {fmt(MAX_VIZ)}</span>
      </div>
    </div>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function CalculadoraIRPF() {
  const [inputMode,   setInputMode]   = useState('anual');
  const [rendimento,  setRendimento]  = useState(60000);
  const [inss,        setInss]        = useState(7200);
  const [dependentes, setDependentes] = useState(0);
  const [saude,       setSaude]       = useState(0);
  const [educacao,    setEducacao]    = useState(0);

  const params = useMemo(() => ({
    rendimento:  inputMode === 'mensal' ? rendimento * 12 : rendimento,
    inss:        inputMode === 'mensal' ? inss       * 12 : inss,
    dependentes,
    saude:       inputMode === 'mensal' ? saude      * 12 : saude,
    educacao:    inputMode === 'mensal' ? educacao   * 12 : educacao,
  }), [inputMode, rendimento, inss, dependentes, saude, educacao]);

  const result = useMemo(() => calcIRPF(params), [params]);

  const { completo, simplificado, melhor, economia } = result;
  const bestResult = melhor === 'completo' ? completo : simplificado;
  const irMensal   = bestResult.irDevido / 12;

  // Hero card color based on effective rate
  const efetiva = bestResult.aliquotaEfetiva;
  const heroColor =
    efetiva === 0       ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700'
    : efetiva < 0.10    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700'
    : efetiva < 0.18    ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700'
    :                     'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700';
  const heroTextColor =
    efetiva === 0       ? 'text-emerald-700 dark:text-emerald-300'
    : efetiva < 0.10    ? 'text-green-700 dark:text-green-300'
    : efetiva < 0.18    ? 'text-yellow-700 dark:text-yellow-300'
    :                     'text-red-700 dark:text-red-300';

  const modeLabel = inputMode === 'mensal' ? 'mensal (R$)' : 'anual (R$)';

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      {/* ── heading ── */}
      <div className="mb-10 text-center">
        <h1 className="mb-3 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
          Calculadora IRPF 2025
        </h1>
        <p className="mx-auto max-w-2xl text-gray-500 dark:text-gray-400">
          Simule seu Imposto de Renda com a tabela progressiva 2024. Compare o modelo
          completo (deduções legais) e o simplificado (20% automático) e descubra qual
          reduz mais o imposto a pagar.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">

        {/* ═══════════════════════════════════════════════════════════════════
            LEFT — form
        ══════════════════════════════════════════════════════════════════════ */}
        <div className="space-y-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-card dark:border-gray-800 dark:bg-gray-900">

          {/* mode toggle */}
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Modo de entrada
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'mensal', label: 'Mensal', desc: 'valores por mês' },
                { key: 'anual',  label: 'Anual',  desc: 'valores por ano' },
              ].map(m => (
                <button
                  key={m.key}
                  onClick={() => setInputMode(m.key)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    inputMode === m.key
                      ? 'border-brand bg-brand/5 dark:bg-brand/10'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <p className={`text-sm font-bold ${inputMode === m.key ? 'text-brand' : 'text-gray-900 dark:text-white'}`}>
                    {m.label}
                  </p>
                  <p className="text-xs text-gray-400">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* currency inputs */}
          <CurrencyInput
            label={`Rendimento tributável ${modeLabel}`}
            id="rendimento"
            value={rendimento}
            onChange={setRendimento}
            hint={
              inputMode === 'mensal'
                ? `Anual: R$ ${fmt(rendimento * 12)}`
                : `Mensal: R$ ${fmt(rendimento / 12)}`
            }
          />

          <CurrencyInput
            label={`Contribuição INSS ${modeLabel}`}
            id="inss"
            value={inss}
            onChange={setInss}
            hint="INSS sobre salário: tabela 2024 — até R$ 7.786,02 → 7,5% a 14%"
          />

          <CurrencyInput
            label={`Despesas médicas ${modeLabel}`}
            id="saude"
            value={saude}
            onChange={setSaude}
            hint="Dedução ilimitada — planos, consultas, cirurgias com recibo"
          />

          <CurrencyInput
            label={`Despesas com educação ${modeLabel}`}
            id="educacao"
            value={educacao}
            onChange={setEducacao}
            hint={`Limite por pessoa: R$ ${fmt(LIMITE_EDUCACAO)}/ano (escola, faculdade, pós)`}
          />

          <DependentStepper value={dependentes} onChange={setDependentes} />

          {/* info box */}
          <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
              Desconto simplificado
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              20% do rendimento, limitado a{' '}
              <span className="font-medium text-gray-700 dark:text-gray-200">
                R$ {fmt(LIMITE_SIMPLIFICADO)}
              </span>{' '}
              — sem necessidade de comprovantes.
            </p>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            RIGHT — results
        ══════════════════════════════════════════════════════════════════════ */}
        <div className="space-y-6">

          {/* ── comparison table ── */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-base font-semibold text-gray-800 dark:text-white">
              Comparativo: Completo × Simplificado
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="pb-2 text-left font-medium text-gray-500 dark:text-gray-400" />
                    <th className={`pb-2 text-right font-semibold ${melhor === 'completo' ? 'text-brand' : 'text-gray-700 dark:text-gray-200'}`}>
                      Completo
                      {melhor === 'completo' && (
                        <span className="ml-1.5 rounded bg-brand/10 px-1.5 py-0.5 text-[10px] font-bold text-brand">
                          ✅ Recomendado
                        </span>
                      )}
                    </th>
                    <th className={`pb-2 text-right font-semibold ${melhor === 'simplificado' ? 'text-brand' : 'text-gray-700 dark:text-gray-200'}`}>
                      Simplificado
                      {melhor === 'simplificado' && (
                        <span className="ml-1.5 rounded bg-brand/10 px-1.5 py-0.5 text-[10px] font-bold text-brand">
                          ✅ Recomendado
                        </span>
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {[
                    {
                      label: 'Total de deduções',
                      c: `R$ ${fmt(completo.totalDeducoes)}`,
                      s: `R$ ${fmt(simplificado.totalDeducoes)}`,
                    },
                    {
                      label: 'Base de cálculo',
                      c: `R$ ${fmt(completo.baseCalculo)}`,
                      s: `R$ ${fmt(simplificado.baseCalculo)}`,
                    },
                    {
                      label: 'IR devido',
                      c: `R$ ${fmt(completo.irDevido)}`,
                      s: `R$ ${fmt(simplificado.irDevido)}`,
                      bold: true,
                    },
                    {
                      label: 'Alíquota efetiva',
                      c: fmtPct(completo.aliquotaEfetiva),
                      s: fmtPct(simplificado.aliquotaEfetiva),
                    },
                  ].map(row => (
                    <tr key={row.label}>
                      <td className="py-2.5 pr-4 text-gray-500 dark:text-gray-400">{row.label}</td>
                      <td className={`py-2.5 text-right tabular-nums ${
                        row.bold ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-200'
                      } ${melhor === 'completo' ? 'text-brand' : ''}`}>
                        {row.c}
                      </td>
                      <td className={`py-2.5 text-right tabular-nums ${
                        row.bold ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-200'
                      } ${melhor === 'simplificado' ? 'text-brand' : ''}`}>
                        {row.s}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── hero result card ── */}
          <div className={`rounded-2xl border p-6 ${heroColor}`}>
            <p className={`text-xs font-semibold uppercase tracking-wide ${heroTextColor} mb-1`}>
              Melhor opção: modelo {melhor}
            </p>
            <p className={`text-3xl font-extrabold ${heroTextColor}`}>
              IR a pagar: R$ {fmt(bestResult.irDevido)}
            </p>
            <p className={`mt-1 text-sm ${heroTextColor} opacity-80`}>
              ≈ R$ {fmt(irMensal)}/mês · alíquota efetiva {fmtPct(bestResult.aliquotaEfetiva)}
            </p>
            {economia > 0 && (
              <p className={`mt-3 inline-block rounded-xl border px-3 py-1.5 text-sm font-semibold ${heroTextColor} border-current`}>
                Economia usando modelo {melhor}: R$ {fmt(economia)}
              </p>
            )}
            {economia === 0 && (
              <p className={`mt-3 text-sm ${heroTextColor} opacity-70`}>
                Ambos os modelos resultam no mesmo imposto.
              </p>
            )}
          </div>

          {/* ── bracket visualization ── */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card dark:border-gray-800 dark:bg-gray-900">
            <BracketViz base={bestResult.baseCalculo} />
          </div>

          {/* ── SEO info cards ── */}
          <div className="grid gap-4 sm:grid-cols-3">
            {/* card 1 */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-2 text-sm font-semibold text-gray-800 dark:text-white">
                Simplificado ou completo: qual escolher?
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Use o <strong className="text-gray-700 dark:text-gray-200">modelo completo</strong> quando
                tiver muitas despesas médicas, dependentes ou gastos educacionais com nota fiscal.
                O <strong className="text-gray-700 dark:text-gray-200">simplificado</strong> é vantajoso para
                quem tem poucas deduções — a dedução automática de 20% (até R$ {fmt(LIMITE_SIMPLIFICADO)})
                costuma superar as deduções individuais.
              </p>
            </div>

            {/* card 2 */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-2 text-sm font-semibold text-gray-800 dark:text-white">
                Quem é obrigado a declarar IR?
              </h3>
              <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                <li>• Rendimentos tributáveis acima de <strong className="text-gray-700 dark:text-gray-200">R$ 33.888,00</strong>/ano (2025)</li>
                <li>• Rendimentos isentos acima de <strong className="text-gray-700 dark:text-gray-200">R$ 200.000,00</strong></li>
                <li>• Receita bruta rural acima de <strong className="text-gray-700 dark:text-gray-200">R$ 169.440,00</strong></li>
                <li>• Bens e direitos acima de <strong className="text-gray-700 dark:text-gray-200">R$ 800.000,00</strong></li>
                <li>• Operações na bolsa de valores</li>
              </ul>
            </div>

            {/* card 3 */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-2 text-sm font-semibold text-gray-800 dark:text-white">
                Como declarar dependentes
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Cada dependente gera dedução de{' '}
                <strong className="text-gray-700 dark:text-gray-200">R$ {fmt(DEDUCAO_DEPENDENTE)}/ano</strong>.
                Podem ser dependentes: cônjuge, filhos até 21 anos (ou 24 se universitários), pais,
                avós e outros com renda inferior ao limite de isenção. Atenção: o dependente não pode
                declarar em separado se já constar na sua declaração.
              </p>
            </div>
          </div>

        </div>{/* end right panel */}
      </div>{/* end grid */}
    </main>
  );
}
