import { useEffect } from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { useMarketData } from '../context/MarketDataContext';

// Slider com label e valor formatado
function RangeInput({ label, id, min, max, step, value, onChange, format }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <span className="rounded-md bg-brand/10 px-2 py-0.5 text-sm font-semibold text-brand">
          {format ? format(value) : value}
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
      <div className="mt-0.5 flex justify-between text-xs text-gray-400">
        <span>{format ? format(min) : min}</span>
        <span>{format ? format(max) : max}</span>
      </div>
    </div>
  );
}

// Input numérico com prefixo/sufixo
function NumberInput({ label, id, value, onChange, prefix, suffix, min = 0, step = 1, hint }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-sm text-gray-400">{prefix}</span>
        )}
        <input
          id={id}
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className={`w-full rounded-xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-900 shadow-inner transition-all focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white ${prefix ? 'pl-8' : 'pl-3'} ${suffix ? 'pr-16' : 'pr-3'}`}
        />
        {suffix && (
          <span className="absolute right-3 text-sm text-gray-400">{suffix}</span>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

// Toggle de período (Meses / Anos) ou (Mensal / Anual)
function PeriodToggle({ value, onChange, options }) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5 dark:border-gray-700 dark:bg-gray-800">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
            value === opt.value
              ? 'bg-white text-brand shadow dark:bg-gray-700'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

const BRL = v => `R$ ${Number(v).toLocaleString('pt-BR')}`;
const PCT = v => `${v}%`;

export default function SimulatorForm() {
  const { params, updateParam } = useSimulator();
  const { rates, isLive, loading } = useMarketData();

  // Atualiza a taxa do formulário sempre que os dados do BCB chegarem
  useEffect(() => {
    if (rates.selic && rates.source !== 'initial') {
      updateParam('annualRate', parseFloat(rates.selic.toFixed(2)));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rates.selic, rates.source]);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Configure sua simulação
        </h2>
        {/* Badge de status da taxa */}
        <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
          loading
            ? 'bg-gray-100 text-gray-400 dark:bg-gray-800'
            : isLive
              ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
        }`}>
          {loading ? (
            <><span className="h-2 w-2 animate-spin rounded-full border border-gray-300 border-t-gray-500" />Atualizando…</>
          ) : isLive ? (
            <><span className="h-2 w-2 rounded-full bg-green-500" />Taxa ao vivo</>
          ) : (
            <><span className="h-2 w-2 rounded-full bg-yellow-400" />Taxa estimada</>
          )}
        </span>
      </div>

      <div className="space-y-6">
        {/* Valor Inicial */}
        <RangeInput
          label="Valor inicial"
          id="initial-value"
          min={0}
          max={100000}
          step={500}
          value={params.initialValue}
          onChange={v => updateParam('initialValue', v)}
          format={BRL}
        />

        {/* Aporte Mensal */}
        <RangeInput
          label="Aporte mensal"
          id="monthly-contrib"
          min={0}
          max={10000}
          step={50}
          value={params.monthlyContrib}
          onChange={v => updateParam('monthlyContrib', v)}
          format={BRL}
        />

        {/* Taxa de Juros */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Taxa de juros
            </label>
            <PeriodToggle
              value={params.rateType}
              onChange={v => updateParam('rateType', v)}
              options={[
                { value: 'annual', label: 'Anual' },
                { value: 'monthly', label: 'Mensal' },
              ]}
            />
          </div>
          <RangeInput
            label=""
            id="annual-rate"
            min={0.1}
            max={params.rateType === 'annual' ? 30 : 3}
            step={params.rateType === 'annual' ? 0.5 : 0.05}
            value={params.annualRate}
            onChange={v => updateParam('annualRate', v)}
            format={PCT}
          />
          <p className="mt-1 text-xs text-gray-400">
            {params.rateType === 'annual'
              ? `Selic: ${rates.selic.toFixed(2)}% · CDI: ${rates.cdi.toFixed(2)}% · Poupança: ${rates.poupanca.toFixed(2)}%`
              : `Selic: ${(rates.selic/12).toFixed(3)}%/mês · CDI: ${(rates.cdi/12).toFixed(3)}%/mês`}
          </p>
        </div>

        {/* Período */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Período de investimento
            </label>
            <PeriodToggle
              value={params.periodType}
              onChange={v => {
                updateParam('periodType', v);
                // Converte valor ao trocar de unidade
                if (v === 'years' && params.periodType === 'months') {
                  updateParam('periods', Math.max(1, Math.round(params.periods / 12)));
                } else if (v === 'months' && params.periodType === 'years') {
                  updateParam('periods', params.periods * 12);
                }
              }}
              options={[
                { value: 'months', label: 'Meses' },
                { value: 'years', label: 'Anos' },
              ]}
            />
          </div>
          <RangeInput
            label=""
            id="periods"
            min={1}
            max={params.periodType === 'years' ? 40 : 120}
            step={1}
            value={params.periods}
            onChange={v => updateParam('periods', v)}
            format={v => `${v} ${params.periodType === 'years' ? (v === 1 ? 'ano' : 'anos') : (v === 1 ? 'mês' : 'meses')}`}
          />
        </div>

        {/* Inflação */}
        <div className="rounded-xl border border-dashed border-gray-200 p-4 dark:border-gray-700">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Ajuste pela inflação
              </p>
              <p className="text-xs text-gray-400">Ver poder de compra real</p>
            </div>
            <button
              onClick={() => updateParam('includeInflation', !params.includeInflation)}
              aria-pressed={params.includeInflation}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                params.includeInflation ? 'bg-brand' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  params.includeInflation ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {params.includeInflation && (
            <RangeInput
              label="Taxa de inflação anual"
              id="inflation-rate"
              min={0}
              max={20}
              step={0.5}
              value={params.inflationRate}
              onChange={v => updateParam('inflationRate', v)}
              format={PCT}
            />
          )}
        </div>
      </div>
    </div>
  );
}
