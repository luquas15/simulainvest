import { useState } from 'react';

/**
 * Slider + input direto.
 * - Arraste o slider para ajuste rápido.
 * - Clique no badge colorido para digitar o valor exato.
 * - Pressione Enter ou clique fora para confirmar.
 */
export default function SliderInput({
  label, id, min, max, step = 1, value, onChange,
  format, hint, badge, showRange = false,
}) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState('');

  const fmt = format ?? (v => v);

  const startEdit = () => {
    setDraft(String(value));
    setEditing(true);
  };

  const commitEdit = () => {
    setEditing(false);
    const raw = parseFloat(String(draft).replace(',', '.'));
    if (!isNaN(raw)) onChange(Math.min(max, Math.max(min, raw)));
  };

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        {label && (
          <label
            htmlFor={id}
            className="flex flex-shrink-0 items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
            {badge && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-400">
                ao vivo
              </span>
            )}
          </label>
        )}

        {editing ? (
          <input
            type="number"
            autoFocus
            value={draft}
            min={min}
            max={max}
            step={step}
            onChange={e => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={e => {
              if (e.key === 'Enter')  commitEdit();
              if (e.key === 'Escape') setEditing(false);
            }}
            className="w-32 rounded-lg border border-brand bg-white px-2 py-0.5 text-right text-sm font-semibold text-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:bg-gray-800 dark:text-brand"
          />
        ) : (
          <button
            type="button"
            onClick={startEdit}
            title="Clique para digitar o valor"
            className="cursor-text rounded-md bg-brand/10 px-2 py-0.5 text-sm font-semibold text-brand transition-colors hover:bg-brand/20"
          >
            {fmt(value)}
          </button>
        )}
      </div>

      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => { setEditing(false); onChange(Number(e.target.value)); }}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-brand dark:bg-gray-700"
      />

      {showRange && (
        <div className="mt-0.5 flex justify-between text-xs text-gray-400">
          <span>{fmt(min)}</span>
          <span>{fmt(max)}</span>
        </div>
      )}
      {hint && <p className="mt-0.5 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}
