import { useState, useMemo, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts';
import { formatCurrency } from '../utils/finance';
import { useMarketData } from '../context/MarketDataContext';

const annualToMonthlyRate = (annual) => Math.pow(1 + annual / 100, 1 / 12) - 1;

function Slider({ label, id, min, max, step, value, onChange, format, hint, badge }) {
  return (
    <div>
      <div className="mb-1 flex justify-between items-center">
        <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          {label}
          {badge && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-400">
              ao vivo
            </span>
          )}
        </label>
        <span className="rounded-md bg-brand/10 px-2 py-0.5 text-sm font-semibold text-brand">
          {format(value)}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-brand dark:bg-gray-700"
      />
      {hint && <p className="mt-0.5 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

const BRL = v => `R$ ${Number(v).toLocaleString('pt-BR')}`;
const PCT = v => `${v}% a.a.`;
const ANOS = v => `${v} anos`;

export default function CalculadoraAluguelCompra() {
  const { rates, isLive } = useMarketData();

  const [imovelValor,          setImovelValor]          = useState(400000);
  const [entrada,              setEntrada]              = useState(20);
  const [taxaFinanciamento,    setTaxaFinanciamento]    = useState(11);
  const [prazoFinanciamento,   setPrazoFinanciamento]   = useState(30);
  const [aluguel,              setAluguel]              = useState(2000);
  const [valorizacaoImovel,    setValorizacaoImovel]    = useState(6);
  const [rendimentoAlternativo, setRendimentoAlternativo] = useState(14.75);
  const [prazoComparacao,      setPrazoComparacao]      = useState(15);

  useEffect(() => {
    if (rates.source === 'initial') return;
    setRendimentoAlternativo(parseFloat(rates.cdi.toFixed(2)));
  }, [rates.cdi, rates.source]);

  const calc = useMemo(() => {
    const entradaValor   = imovelValor * entrada / 100;
    const financiado     = imovelValor - entradaValor;
    const custosIniciais = imovelValor * 0.04; // ITBI + escritura ~4%
    const taxaMensal     = annualToMonthlyRate(taxaFinanciamento);
    const meses          = prazoFinanciamento * 12;

    // PMT (sistema PRICE)
    const pmt =
      financiado *
      (taxaMensal * Math.pow(1 + taxaMensal, meses)) /
      (Math.pow(1 + taxaMensal, meses) - 1);

    // Extras mensais (IPTU + condomínio estimado)
    const extrasCompra = imovelValor * 0.005 / 12;

    const cdiMensal         = annualToMonthlyRate(rendimentoAlternativo);
    const valorizacaoMensal = annualToMonthlyRate(valorizacaoImovel);

    let saldoDevedor     = financiado;
    let imovelPrice      = imovelValor;
    let portfolioAluguel = entradaValor; // começa investindo a entrada
    let aluguelAtual     = aluguel;
    const chartData      = [];
    let totalGastoCompra = entradaValor + custosIniciais;
    let totalGastoAluguel = 0;

    for (let m = 1; m <= prazoComparacao * 12; m++) {
      // --- Compra ---
      const jurosDevidos  = saldoDevedor * taxaMensal;
      const amortizacao   = pmt - jurosDevidos;
      saldoDevedor        = Math.max(0, saldoDevedor - amortizacao);
      imovelPrice        *= (1 + valorizacaoMensal);
      const patrimonioCompra = imovelPrice - saldoDevedor;
      totalGastoCompra   += pmt + extrasCompra;

      // --- Aluguel ---
      if (m % 12 === 0) aluguelAtual *= (1 + 5 / 100); // reajuste anual de 5%
      portfolioAluguel   *= (1 + cdiMensal);
      // Se comprar for mais caro, a diferença entra no portfolio; se alugar for mais caro, sai do portfolio
      const diferencaMensal = pmt + extrasCompra - aluguelAtual;
      portfolioAluguel   += diferencaMensal;
      portfolioAluguel    = Math.max(0, portfolioAluguel);
      totalGastoAluguel  += aluguelAtual;

      if (m % 12 === 0) {
        chartData.push({
          year: m / 12,
          'Comprar': Math.round(patrimonioCompra),
          'Alugar':  Math.round(portfolioAluguel),
        });
      }
    }

    const breakEven    = chartData.find(d => d['Comprar'] >= d['Alugar'])?.year ?? null;
    const finalCompra  = chartData[chartData.length - 1]?.['Comprar'] ?? 0;
    const finalAluguel = chartData[chartData.length - 1]?.['Alugar']  ?? 0;
    const melhorOpcao  = finalCompra >= finalAluguel ? 'compra' : 'aluguel';

    return {
      entradaValor,
      financiado,
      custosIniciais,
      pmt,
      extrasCompra,
      chartData,
      breakEven,
      finalCompra,
      finalAluguel,
      melhorOpcao,
      totalGastoCompra,
      totalGastoAluguel,
      diferencaMensal: pmt + extrasCompra - aluguel,
    };
  }, [
    imovelValor, entrada, taxaFinanciamento, prazoFinanciamento,
    aluguel, valorizacaoImovel, rendimentoAlternativo, prazoComparacao,
  ]);

  const yFormatter = v =>
    v >= 1_000_000
      ? `${(v / 1e6).toFixed(1)}M`
      : v >= 1000
      ? `${(v / 1000).toFixed(0)}k`
      : String(v);

  const PRAZOS = [5, 10, 15, 20, 25, 30];

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      {/* Cabeçalho */}
      <div className="mb-10 text-center">
        <h1 className="mb-3 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
          Alugar ou Comprar Imóvel?
        </h1>
        <p className="mx-auto max-w-2xl text-gray-500 dark:text-gray-400">
          Compare o patrimônio líquido projetado entre comprar financiado e alugar investindo a
          entrada no CDI. Descubra quando — e se — comprar vale mais a pena.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        {/* ─── Painel de controles ─── */}
        <div className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-card dark:border-gray-800 dark:bg-gray-900">

          {/* O Imóvel */}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">O Imóvel</p>
            <div className="space-y-4">
              <Slider
                label="Valor do imóvel" id="imovelValor"
                min={100000} max={3000000} step={10000}
                value={imovelValor} onChange={setImovelValor}
                format={BRL}
              />
              <Slider
                label="Entrada" id="entrada"
                min={5} max={50} step={5}
                value={entrada} onChange={setEntrada}
                format={v => `${v}%`}
                hint={`Entrada: ${BRL(calc.entradaValor)}`}
              />
              <Slider
                label="Taxa de financiamento" id="taxaFinanciamento"
                min={5} max={20} step={0.5}
                value={taxaFinanciamento} onChange={setTaxaFinanciamento}
                format={PCT}
              />
              <Slider
                label="Prazo do financiamento" id="prazoFinanciamento"
                min={5} max={35} step={5}
                value={prazoFinanciamento} onChange={setPrazoFinanciamento}
                format={ANOS}
              />
            </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Custos mensais */}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Custos mensais</p>
            <div className="space-y-4">
              <Slider
                label="Aluguel atual" id="aluguel"
                min={500} max={20000} step={500}
                value={aluguel} onChange={setAluguel}
                format={BRL}
              />
              <Slider
                label="Valorização do imóvel" id="valorizacaoImovel"
                min={0} max={15} step={0.5}
                value={valorizacaoImovel} onChange={setValorizacaoImovel}
                format={PCT}
              />
            </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Rendimento alternativo */}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Rendimento alternativo</p>
            <Slider
              label="CDI (rendimento da entrada)" id="rendimentoAlternativo"
              min={5} max={20} step={0.25}
              value={rendimentoAlternativo} onChange={setRendimentoAlternativo}
              format={PCT}
              badge={isLive}
              hint="Taxa usada para simular o investimento da entrada caso não compre"
            />
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Prazo de comparação */}
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Prazo de comparação</p>
            <div className="flex flex-wrap gap-2">
              {PRAZOS.map(p => (
                <button
                  key={p}
                  onClick={() => setPrazoComparacao(p)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                    prazoComparacao === p
                      ? 'border-brand bg-brand/10 text-brand'
                      : 'border-gray-200 text-gray-600 hover:border-brand hover:text-brand dark:border-gray-700 dark:text-gray-400'
                  }`}
                >
                  {p} anos
                </button>
              ))}
            </div>
          </div>

          {/* Resumo calculado */}
          <div className="rounded-xl bg-gray-50 p-4 space-y-1 dark:bg-gray-800">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Parcela mensal (PRICE):</span>
              <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(calc.pmt)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Entrada necessária:</span>
              <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(calc.entradaValor)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">ITBI + escritura (4%):</span>
              <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(calc.custosIniciais)}</span>
            </div>
          </div>
        </div>

        {/* ─── Resultados ─── */}
        <div className="space-y-6">

          {/* Hero: Comprar vs Alugar */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Comprar */}
            <div className={`relative rounded-2xl p-6 transition-all ${
              calc.melhorOpcao === 'compra'
                ? 'bg-gradient-to-br from-brand to-green-500 text-white shadow-glow'
                : 'border border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800'
            }`}>
              {calc.melhorOpcao === 'compra' && (
                <span className="absolute right-4 top-4 rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold text-white">
                  Melhor opção
                </span>
              )}
              <p className={`mb-1 text-xs font-semibold uppercase tracking-widest ${
                calc.melhorOpcao === 'compra' ? 'text-white/70' : 'text-gray-400'
              }`}>
                Comprar
              </p>
              <p className={`text-3xl font-extrabold ${
                calc.melhorOpcao === 'compra' ? 'text-white' : 'text-gray-900 dark:text-white'
              }`}>
                {formatCurrency(calc.finalCompra)}
              </p>
              <p className={`mt-1 text-sm ${
                calc.melhorOpcao === 'compra' ? 'text-white/70' : 'text-gray-400'
              }`}>
                Patrimônio líquido em {prazoComparacao} anos
              </p>
            </div>

            {/* Alugar */}
            <div className={`relative rounded-2xl p-6 transition-all ${
              calc.melhorOpcao === 'aluguel'
                ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg'
                : 'border border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800'
            }`}>
              {calc.melhorOpcao === 'aluguel' && (
                <span className="absolute right-4 top-4 rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold text-white">
                  Melhor opção
                </span>
              )}
              <p className={`mb-1 text-xs font-semibold uppercase tracking-widest ${
                calc.melhorOpcao === 'aluguel' ? 'text-white/70' : 'text-gray-400'
              }`}>
                Alugar + Investir
              </p>
              <p className={`text-3xl font-extrabold ${
                calc.melhorOpcao === 'aluguel' ? 'text-white' : 'text-gray-900 dark:text-white'
              }`}>
                {formatCurrency(calc.finalAluguel)}
              </p>
              <p className={`mt-1 text-sm ${
                calc.melhorOpcao === 'aluguel' ? 'text-white/70' : 'text-gray-400'
              }`}>
                Portfolio projetado em {prazoComparacao} anos
              </p>
            </div>
          </div>

          {/* Break-even banner */}
          {calc.breakEven !== null ? (
            <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-3 dark:border-green-800/40 dark:bg-green-900/15">
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                Comprar começa a valer mais a pena financeiramente após{' '}
                <strong>{calc.breakEven} {calc.breakEven === 1 ? 'ano' : 'anos'}</strong> — veja o break-even no gráfico.
              </p>
            </div>
          ) : calc.melhorOpcao === 'aluguel' ? (
            <div className="rounded-xl border border-purple-200 bg-purple-50 px-5 py-3 dark:border-purple-800/40 dark:bg-purple-900/15">
              <p className="text-sm font-medium text-purple-800 dark:text-purple-300">
                Nos {prazoComparacao} anos simulados, alugar e investir supera a compra com os parâmetros atuais.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-brand/30 bg-brand/5 px-5 py-3">
              <p className="text-sm font-medium text-brand">
                Comprar é a melhor opção financeira desde o início neste cenário.
              </p>
            </div>
          )}

          {/* 4 stat cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              {
                label: 'Parcela mensal',
                value: formatCurrency(calc.pmt),
                highlight: true,
              },
              {
                label: 'Entrada necessária',
                value: formatCurrency(calc.entradaValor),
              },
              {
                label: 'ITBI + cartório (4%)',
                value: formatCurrency(calc.custosIniciais),
              },
              {
                label: 'Diferença mensal',
                value: formatCurrency(Math.abs(calc.diferencaMensal)),
                sub: calc.diferencaMensal >= 0 ? 'compra custa mais' : 'aluguel custa mais',
                negative: calc.diferencaMensal < 0,
              },
            ].map(c => (
              <div
                key={c.label}
                className={`rounded-xl p-4 ${
                  c.highlight
                    ? 'bg-gradient-to-br from-brand to-green-500 text-white shadow-glow'
                    : 'border border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800'
                }`}
              >
                <p className={`mb-1 text-xs ${c.highlight ? 'text-white/70' : 'text-gray-400'}`}>
                  {c.label}
                </p>
                <p className={`text-xl font-extrabold ${c.highlight ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                  {c.value}
                </p>
                {c.sub && (
                  <p className={`mt-0.5 text-xs ${c.negative ? 'text-purple-500' : 'text-gray-400'}`}>
                    {c.sub}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Gráfico */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
              Evolução do patrimônio líquido
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={calc.chartData} margin={{ top: 5, right: 5, bottom: 5, left: 10 }}>
                <defs>
                  <linearGradient id="gradComprar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00D46A" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#00D46A" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gradAlugar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#8B5CF6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" strokeOpacity={0.5} />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => `${v}a`}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={yFormatter}
                  width={55}
                />
                <Tooltip
                  formatter={v => [formatCurrency(v)]}
                  labelFormatter={l => `Ano ${l}`}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" iconSize={8} />
                {calc.breakEven !== null && (
                  <ReferenceLine
                    x={calc.breakEven}
                    stroke="#F59E0B"
                    strokeDasharray="5 3"
                    label={{ value: 'Break-even', fill: '#F59E0B', fontSize: 11, position: 'insideTopLeft' }}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="Comprar"
                  stroke="#00D46A"
                  strokeWidth={2}
                  fill="url(#gradComprar)"
                />
                <Area
                  type="monotone"
                  dataKey="Alugar"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  fill="url(#gradAlugar)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Disclaimer */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/30 dark:bg-amber-900/10">
            <p className="mb-1 text-xs font-semibold text-amber-700 dark:text-amber-400">Premissas da simulação</p>
            <ul className="list-inside list-disc space-y-0.5 text-xs text-amber-700 dark:text-amber-400">
              <li>ITBI + escritura estimados em 4% do valor do imóvel (varia por município).</li>
              <li>Aluguel reajustado anualmente em 5% (aproximação do IGP-M histórico).</li>
              <li>IPTU e condomínio estimados em 0,5% a.a. do valor do imóvel.</li>
              <li>Financiamento pelo sistema PRICE (parcelas fixas).</li>
              <li>Seguro obrigatório (MIP/DFI) e custo do INSS não estão incluídos.</li>
              <li>Simulação meramente educacional — consulte um especialista antes de decidir.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* SEO info cards */}
      <section className="mt-12 grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-3 font-bold text-gray-900 dark:text-white">
            Quando comprar vale mais a pena?
          </h2>
          <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            Além dos números, comprar faz sentido quando você planeja ficar no imóvel por muitos anos,
            quer estabilidade para família ou negócio, ou valoriza aspectos emocionais como
            personalização e segurança de posse. Cidades com forte valorização imobiliária também
            tendem a favorecer a compra no longo prazo.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-3 font-bold text-gray-900 dark:text-white">
            ITBI e custos de cartório
          </h2>
          <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            O ITBI (Imposto de Transmissão de Bens Imóveis) varia geralmente entre 2% e 3% do valor do
            imóvel dependendo do município. Somando escritura pública, registro em cartório e emolumentos,
            o custo total de transferência costuma ficar entre 3% e 5%. Esse custo é imediato e não
            recuperável, por isso pesa bastante na comparação de curto prazo.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-3 font-bold text-gray-900 dark:text-white">
            O custo de oportunidade da entrada
          </h2>
          <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            Ao comprar um imóvel, você imobiliza a entrada — capital que poderia estar rendendo no CDI,
            Tesouro Selic ou outros investimentos. Em cenários de juros elevados, como o Brasil atual,
            esse custo de oportunidade pode ser muito significativo e costuma ser o principal fator que
            favorece o aluguel no curto e médio prazo.
          </p>
        </div>
      </section>
    </main>
  );
}
