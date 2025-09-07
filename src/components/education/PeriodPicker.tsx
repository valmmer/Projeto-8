// src/components/education/PeriodPicker.tsx
import React, { useEffect, useMemo, useState } from 'react';

// "MM/YYYY - MM/YYYY" | "MM/YYYY - Atual"
const RE = /^(0[1-9]|1[0-2])\/(\d{4})\s-\s((0[1-9]|1[0-2])\/(\d{4})|Atual)$/;

function isValidPeriod(v: string) {
  return RE.test((v || '').trim());
}

function split(v: string) {
  const m = (v || '').trim().match(RE);
  if (!m)
    return { iniMes: '', iniAno: '', fimMes: '', fimAno: '', atual: false };
  const iniMes = m[1];
  const iniAno = m[2];
  const tail = m[3];
  if (tail === 'Atual')
    return { iniMes, iniAno, fimMes: '', fimAno: '', atual: true };
  const [fm, fa] = tail.split('/');
  return { iniMes, iniAno, fimMes: fm, fimAno: fa, atual: false };
}

function build(p: {
  iniMes: string;
  iniAno: string;
  fimMes?: string;
  fimAno?: string;
  atual?: boolean;
}) {
  const ini = `${p.iniMes}/${p.iniAno}`;
  const fim = p.atual ? 'Atual' : `${p.fimMes}/${p.fimAno}`;
  return `${ini} - ${fim}`;
}

const MESES = [
  { v: '01', t: 'jan' },
  { v: '02', t: 'fev' },
  { v: '03', t: 'mar' },
  { v: '04', t: 'abr' },
  { v: '05', t: 'mai' },
  { v: '06', t: 'jun' },
  { v: '07', t: 'jul' },
  { v: '08', t: 'ago' },
  { v: '09', t: 'set' },
  { v: '10', t: 'out' },
  { v: '11', t: 'nov' },
  { v: '12', t: 'dez' },
];

type Props = {
  value: string;
  onChange: (v: string) => void;
  minYear?: number;
  maxYear?: number;
  allowOpenEnded?: boolean;
  error?: string;
  /** Texto de ajuda (por ex. diferente em Experiência) */
  helpText?: string;
  /** Rótulos customizáveis */
  startLabel?: string;
  endLabel?: string;
};

export default function PeriodPicker({
  value,
  onChange,
  minYear,
  maxYear,
  allowOpenEnded = true,
  error,
  helpText,
  startLabel = 'Início',
  endLabel = 'Fim',
}: Props) {
  const [parts, setParts] = useState(() => split(value));

  useEffect(() => {
    const builtNow = isValidPeriod(value) ? value : '';
    const builtParts = isValidPeriod(build(parts)) ? build(parts) : '';
    if (builtNow !== builtParts) setParts(split(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const years = useMemo(() => {
    const now = new Date().getFullYear();
    const min = typeof minYear === 'number' ? minYear : now - 60;
    const max = typeof maxYear === 'number' ? maxYear : now;
    const out: string[] = [];
    for (let y = max; y >= min; y--) out.push(String(y));
    return out;
  }, [minYear, maxYear]);

  const set = (patch: Partial<typeof parts>) => {
    let next = { ...parts, ...patch };
    if (!allowOpenEnded) next.atual = false;

    const hasInicio = !!(next.iniMes && next.iniAno);
    const hasFim = !!(next.fimMes && next.fimAno);
    if (hasInicio && !next.atual && !hasFim) {
      next.fimMes = next.iniMes;
      next.fimAno = next.iniAno;
    }
    if (patch.atual === true) {
      next.fimMes = '';
      next.fimAno = '';
    }
    setParts(next);

    const inicioOk = !!(next.iniMes && next.iniAno);
    const fimOk = !!next.atual || !!(next.fimMes && next.fimAno);
    const maybe = build({
      iniMes: next.iniMes,
      iniAno: next.iniAno,
      fimMes: next.atual ? undefined : next.fimMes,
      fimAno: next.atual ? undefined : next.fimAno,
      atual: next.atual,
    });

    if (inicioOk && fimOk && isValidPeriod(maybe)) onChange(maybe);
    else onChange('');
  };

  const clear = () => {
    setParts({ iniMes: '', iniAno: '', fimMes: '', fimAno: '', atual: false });
    onChange('');
  };

  const hasValue = isValidPeriod(value);
  const helpId = 'period-help';
  const finalHelp = helpText ?? 'Ex.: 05/2021 - Atual ou 03/2019 - 08/2020';

  return (
    <div className="flex flex-col gap-2">
      <div
        className={[
          'rounded-2xl border bg-white/70 px-3 py-3',
          error ? 'ring-1 ring-red-500 border-red-500/60' : '',
        ].join(' ')}
        aria-describedby={helpId}
      >
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
          {/* Início */}
          <div className="sm:col-span-2">
            <div className="grid grid-cols-2 gap-2">
              <select
                className="input w-full min-w-[110px]"
                aria-label="Mês inicial"
                value={parts.iniMes}
                onChange={(e) => set({ iniMes: e.target.value })}
              >
                <option value="">Mês</option>
                {MESES.map((m) => (
                  <option key={m.v} value={m.v}>
                    {m.t}
                  </option>
                ))}
              </select>
              <select
                className="input w-full min-w-[110px]"
                aria-label="Ano inicial"
                value={parts.iniAno}
                onChange={(e) => set({ iniAno: e.target.value })}
              >
                <option value="">Ano</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">{startLabel}</p>
          </div>

          {/* Centro: botão Atual */}
          <div className="sm:col-span-1 flex items-center justify-center">
            {allowOpenEnded ? (
              <button
                type="button"
                onClick={() => set({ atual: !parts.atual })}
                className={[
                  'px-4 py-2 rounded-full border transition',
                  parts.atual
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'hover:bg-slate-50',
                ].join(' ')}
                aria-pressed={parts.atual}
              >
                Atual
              </button>
            ) : (
              <span className="text-slate-400 select-none">→</span>
            )}
          </div>

          {/* Fim */}
          {!parts.atual && (
            <div className="sm:col-span-2">
              <div className="grid grid-cols-2 gap-2">
                <select
                  className="input w-full min-w-[110px]"
                  aria-label="Mês final"
                  value={parts.fimMes}
                  onChange={(e) => set({ fimMes: e.target.value })}
                >
                  <option value="">Mês</option>
                  {MESES.map((m) => (
                    <option key={m.v} value={m.v}>
                      {m.t}
                    </option>
                  ))}
                </select>
                <select
                  className="input w-full min-w-[110px]"
                  aria-label="Ano final"
                  value={parts.fimAno}
                  onChange={(e) => set({ fimAno: e.target.value })}
                >
                  <option value="">Ano</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">{endLabel}</p>
            </div>
          )}
        </div>

        {/* Resumo + limpar */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="text-xs text-slate-600" aria-live="polite">
            {hasValue ? (
              <span className="inline-flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-slate-100 border text-slate-700">
                  {value}
                </span>
              </span>
            ) : (
              <span className="text-slate-400">
                Selecione mês e ano (ou marque “Atual”)
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={clear}
            className="text-xs px-3 py-1.5 rounded-md border hover:bg-slate-50"
            aria-label="Limpar período"
          >
            Limpar
          </button>
        </div>
      </div>

      {/* Ajuda / erro */}
      {error ? (
        <p className="help text-red-600">{error}</p>
      ) : (
        <p id={helpId} className="help text-slate-500">
          {finalHelp}
        </p>
      )}
    </div>
  );
}
