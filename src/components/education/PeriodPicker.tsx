// src/components/education/PeriodPicker.tsx
import React, { useMemo } from 'react';

type Props = {
  value: string;
  onChange: (v: string) => void;
  allowOpenEnded?: boolean;
  error?: string;
  minYear?: number;
  maxYear?: number;
};

const RE_PERIOD =
  /^(0[1-9]|1[0-2])\/(\d{4})\s-\s((0[1-9]|1[0-2])\/(\d{4})|Atual)$/;

function pad2(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

export default function PeriodPicker({
  value,
  onChange,
  allowOpenEnded,
  error,
  minYear,
  maxYear,
}: Props) {
  const anoAtual = new Date().getFullYear();
  const yMin = minYear ?? anoAtual - 60;
  const yMax = maxYear ?? anoAtual;

  const years = useMemo(() => {
    const out: string[] = [];
    for (let y = yMax; y >= yMin; y--) out.push(String(y));
    return out;
  }, [yMin, yMax]);

  const months = useMemo(
    () => Array.from({ length: 12 }, (_, i) => pad2(i + 1)),
    [],
  );

  const parsed = useMemo(() => {
    const m = RE_PERIOD.exec(value || '');
    if (!m) return { sm: '', sy: '', em: '', ey: '', isOpen: false };
    const sm = m[1],
      sy = m[2],
      right = m[3];
    if (right === 'Atual') return { sm, sy, em: '', ey: '', isOpen: true };
    const em = m[4],
      ey = m[5];
    return { sm, sy, em, ey, isOpen: false };
  }, [value]);

  function emit(next: {
    sm?: string;
    sy?: string;
    em?: string;
    ey?: string;
    isOpen?: boolean;
  }) {
    const sm = next.sm ?? parsed.sm;
    const sy = next.sy ?? parsed.sy;
    const isOpen = next.isOpen ?? parsed.isOpen;
    const em = next.em ?? parsed.em;
    const ey = next.ey ?? parsed.ey;
    if (!sm || !sy) return;
    const right = isOpen ? 'Atual' : em && ey ? `${em}/${ey}` : '';
    if (!right) return;
    onChange(`${sm}/${sy} - ${right}`);
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <div>
        <label className="label">Início (mês)</label>
        <select
          className="input"
          value={parsed.sm}
          onChange={(e) => emit({ sm: e.currentTarget.value })}
        >
          <option value="">Mês…</option>
          {months.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Início (ano)</label>
        <select
          className="input"
          value={parsed.sy}
          onChange={(e) => emit({ sy: e.currentTarget.value })}
        >
          <option value="">Ano…</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Fim (mês)</label>
        <select
          className="input"
          value={parsed.isOpen ? '' : parsed.em}
          onChange={(e) => emit({ em: e.currentTarget.value, isOpen: false })}
          disabled={allowOpenEnded && parsed.isOpen}
        >
          <option value="">Mês…</option>
          {months.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label className="label">Fim (ano)</label>
          {allowOpenEnded && (
            <label className="text-xs text-slate-600 flex items-center gap-1">
              <input
                type="checkbox"
                checked={parsed.isOpen}
                onChange={(e) => emit({ isOpen: e.currentTarget.checked })}
              />
              Até o momento
            </label>
          )}
        </div>
        <select
          className="input"
          value={parsed.isOpen ? '' : parsed.ey}
          onChange={(e) => emit({ ey: e.currentTarget.value, isOpen: false })}
          disabled={allowOpenEnded && parsed.isOpen}
        >
          <option value="">Ano…</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="sm:col-span-4 text-sm text-red-600">{error}</div>
      )}
    </div>
  );
}
