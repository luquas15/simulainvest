import { useState, useMemo, useEffect } from 'react';
import { compareAllInvestments } from '../utils/investments';
import { formatCurrency } from '../utils/finance';
import { useMarketData } from '../context/MarketDataContext';
import { fetchAssetPrices } from '../utils/assetApi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import AdUnit, { AD_SLOTS } from '../components/AdUnit';
import { usePageTitle } from '../hooks/usePageTitle';

function Slider({ label, id, min, max, step, value, onChange, format }) {
  return (
    <div>
      <div className="mb-1 flex justify-between">
        <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <span className="rounded-md bg-brand/10 px-2 py-0.5 text-sm font-semibold text-brand">{format(value)}</span>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-brand dark:bg-gray-700"
      />
    </div>
  );
}

const PERIOD_OPTS = [
  { label: '6 meses',  value: 6 },
  { label: '1 ano',    value: 12 },
  { label: '2 anos',   value: 24 },
  { label: '5 anos',   value: 60 },
  { label: '10 anos',  value: 120 },
];

const RISK_BADGE = {
  'Baixíssimo': 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  'Baixo':      'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  'Moderado':   'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
  'Alto':       'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  'Muito Alto': 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
};

function ChangeBadge({ value }) {
  if (value == null) return null;
  const pos = value >= 0;
  return (
    <span className={`ml-1 rounded-full px-1.5 py-0.5 text-xs font-semibold ${
      pos ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400'
          : 'bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400'
    }`}>
      {pos ? '+' : ''}{value.toFixed(2)}%
    </span>
  );
}

export default function ComparadorInvestimentos() {
  usePageTitle('Comparador de Investimentos');
  const { rates, isLive } = useMarketData();
  const [principal, setPrincipal] = useState(10000);
  const [months,    setMonths]    = useState(12);
  const [cdiRate,   setCdiRate]   = useState(14.75);
  const [assets,    setAssets]    = useState(null);
  const [assetsLoading, setAssetsLoading] = useState(true);

  // Sincroniza CDI com dados ao vivo do BCB
  useEffect(() => {
    if (rates.cdi && rates.source !== 'initial') {
      setCdiRate(parseFloat(rates.cdi.toFixed(2)));
    }
  }, [rates.cdi, rates.source]);

  // Busca preços ao vivo de cripto e câmbio (CoinGecko + Frankfurter)
  useEffect(() => {
    fetchAssetPrices()
      .then(setAssets)
      .catch(() => {})
      .finally(() => setAssetsLoading(false));
  }, []);

  const results = useMemo(
    () => compareAllInvestments({ principal, months, cdiRate }),
    [principal, months, cdiRate]
  );

  const best = results[0];
  const winner = best?.netFinal ?? 0;

  const chartData = results.map(r => ({
    name: r.name,
    'Líquido': r.netFinal,
    color: r.color,
  }));

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-10 text-center">
        <h1 className="mb-3 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
          Comparador de Investimentos
        </h1>
        <p className="mx-auto max-w-2xl text-gray-500 dark:text-gray-400">
          Poupança, CDB, LCI, Tesouro Direto, FIIs, Ações, S&P 500, Ouro, Dólar, Bitcoin e Ethereum —
          veja quanto rende cada um com desconto de IR, no mesmo prazo.
        </p>
      </div>

      {/* Controles */}
      <div className="mb-8 grid gap-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-card dark:border-gray-800 dark:bg-gray-900 sm:grid-cols-3">
        <Slider label="Capital investido" id="principal" min={1000} max={500000} step={1000} value={principal} onChange={setPrincipal} format={v => `R$ ${Number(v).toLocaleString('pt-BR')}`} />
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Prazo</p>
          <div className="flex flex-wrap gap-2">
            {PERIOD_OPTS.map(opt => (
              <button key={opt.value} onClick={() => setMonths(opt.value)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                  months === opt.value
                    ? 'border-brand bg-brand/10 text-brand'
                    : 'border-gray-200 text-gray-600 hover:border-brand dark:border-gray-700 dark:text-gray-400'
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">CDI / Selic</span>
            {isLive && (
              <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />ao vivo · BCB
              </span>
            )}
          </div>
          <Slider label="" id="cdi" min={5} max={20} step={0.25} value={cdiRate} onChange={setCdiRate} format={v => `${v}% a.a.`} />
        </div>
      </div>

      {/* Ticker de preços ao vivo */}
      {(assets?.source === 'live' || assetsLoading) && (
        <div className="mb-8 flex flex-wrap gap-3">
          {assetsLoading ? (
            <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-4 py-2 text-xs text-gray-400 dark:border-gray-800 dark:bg-gray-900">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-brand" />
              Buscando preços ao vivo…
            </div>
          ) : (
            <>
              {assets?.btcBrl && (
                <div className="flex items-center gap-2 rounded-xl border border-orange-100 bg-orange-50 px-4 py-2 dark:border-orange-900/30 dark:bg-orange-900/10">
                  <span className="text-base">₿</span>
                  <div>
                    <p className="text-xs font-medium text-orange-700 dark:text-orange-400">Bitcoin</p>
                    <p className="text-sm font-bold text-orange-900 dark:text-orange-300">
                      {formatCurrency(assets.btcBrl)}
                      <ChangeBadge value={assets.btcChange24h} />
                    </p>
                  </div>
                </div>
              )}
              {assets?.ethBrl && (
                <div className="flex items-center gap-2 rounded-xl border border-purple-100 bg-purple-50 px-4 py-2 dark:border-purple-900/30 dark:bg-purple-900/10">
                  <span className="text-base">Ξ</span>
                  <div>
                    <p className="text-xs font-medium text-purple-700 dark:text-purple-400">Ethereum</p>
                    <p className="text-sm font-bold text-purple-900 dark:text-purple-300">
                      {formatCurrency(assets.ethBrl)}
                      <ChangeBadge value={assets.ethChange24h} />
                    </p>
                  </div>
                </div>
              )}
              {assets?.usdBrl && (
                <div className="flex items-center gap-2 rounded-xl border border-green-100 bg-green-50 px-4 py-2 dark:border-green-900/30 dark:bg-green-900/10">
                  <span className="text-base font-bold text-green-700">$</span>
                  <div>
                    <p className="text-xs font-medium text-green-700 dark:text-green-400">Dólar (USD/BRL)</p>
                    <p className="text-sm font-bold text-green-900 dark:text-green-300">
                      R$ {assets.usdBrl.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center self-center rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-400 dark:bg-gray-800">
                <span className="mr-1 h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />
                ao vivo · CoinGecko / Frankfurter · atualiza em 15 min
              </div>
            </>
          )}
        </div>
      )}

      {/* Gráfico de barras */}
      <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-card dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
          Saldo líquido final comparado
        </h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 40, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" strokeOpacity={0.5} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} angle={-30} textAnchor="end" interval={0} />
            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false}
              tickFormatter={v => v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : `${(v/1000).toFixed(0)}k`} width={55} />
            <Tooltip
              formatter={v => [formatCurrency(v), 'Líquido']}
              contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
            />
            <Bar dataKey="Líquido" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabela detalhada */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-card dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Detalhamento por produto
          </h2>
          <p className="text-xs text-gray-400">Ordenado por rentabilidade líquida (após IR)</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-800/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Produto</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 sm:table-cell">Categoria</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 md:table-cell">Taxa bruta</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Líquido final</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 sm:table-cell">Lucro líquido</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Risco</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 lg:table-cell">Garantia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {results.map((r, i) => {
                const diffFromBest = r.netFinal - winner;
                const isBest = i === 0;
                return (
                  <tr key={r.id} className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${isBest ? 'bg-brand/3' : ''}`}>
                    <td className="px-4 py-3">
                      {isBest
                        ? <span className="rounded-full bg-brand px-2 py-0.5 text-xs font-bold text-white">🏆</span>
                        : <span className="text-gray-400 text-xs">#{i+1}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: r.color }} />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{r.name}</p>
                          <p className="hidden text-xs text-gray-400 max-w-[200px] truncate sm:block">{r.description}</p>
                          {r.id === 'btc' && assets?.btcBrl && (
                            <p className="text-xs text-orange-500 font-medium">
                              {formatCurrency(assets.btcBrl)} <ChangeBadge value={assets.btcChange24h} />
                            </p>
                          )}
                          {r.id === 'eth' && assets?.ethBrl && (
                            <p className="text-xs text-purple-500 font-medium">
                              {formatCurrency(assets.ethBrl)} <ChangeBadge value={assets.ethChange24h} />
                            </p>
                          )}
                          {r.id === 'dolar' && assets?.usdBrl && (
                            <p className="text-xs text-green-600 font-medium">
                              R$ {assets.usdBrl.toFixed(2)} / USD ao vivo
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-gray-500 dark:text-gray-400 sm:table-cell">{r.category}</td>
                    <td className="hidden px-4 py-3 font-medium text-gray-700 dark:text-gray-300 md:table-cell">{r.annualRate.toFixed(2)}% a.a.</td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(r.netFinal)}</p>
                      {diffFromBest < 0 && (
                        <p className="text-xs text-red-400">{formatCurrency(diffFromBest)}</p>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 font-semibold text-green-600 dark:text-green-400 sm:table-cell">
                      +{formatCurrency(r.netProfit)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${RISK_BADGE[r.risk] ?? ''}`}>
                        {r.risk}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-gray-400 lg:table-cell">{r.guarantee}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-100 px-6 py-3 dark:border-gray-700">
          <p className="text-xs text-gray-400">
            * Simulação com fins educacionais. IR calculado pela tabela regressiva (renda fixa) ou 15% flat (cripto, ouro, câmbio). Taxas de renda variável e cripto são médias históricas — volatilidade passada não garante retorno futuro.
          </p>
        </div>
      </div>

      <AdUnit slot={AD_SLOTS.HORIZONTAL} className="mt-8" />

      {/* SEO content */}
      <section className="mt-10 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-3 font-bold text-gray-900 dark:text-white">CDB vs LCI: qual é melhor?</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            O CDB paga IR (15–22,5%) mas costuma oferecer taxas maiores. A LCI/LCA é isenta, mas geralmente
            oferece 90–95% do CDI. Para prazos longos (2+ anos), o CDB acima de 115% do CDI costuma superar a LCI.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-3 font-bold text-gray-900 dark:text-white">Poupança ainda vale a pena?</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Com Selic acima de 8,5% a.a., a poupança rende apenas 0,5% ao mês + TR — bem abaixo do CDI.
            O Tesouro Selic com liquidez diária é uma alternativa superior para reserva de emergência.
          </p>
        </div>
      </section>
    </main>
  );
}
