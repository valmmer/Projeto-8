import React, { useMemo } from 'react';

// Função auxiliar que valida se a string está no formato aceito.
export function isValidPeriod(v: string): boolean {
  const re = /^(0[1-9]|1[0-2])\/(\d{4})\s-\s((0[1-9]|1[0-2])\/(\d{4})|Atual)$/;
  return re.test(v.trim());
}

// Constrói a string de período a partir das partes (início e fim).
function buildPeriod({
  iniMes,
  iniAno,
  fimMes,
  fimAno,
  atual,
}: {
  iniMes: string;
  iniAno: string;
  fimMes?: string;
  fimAno?: string;
  atual?: boolean;
}): string {
  const ini = `${iniMes}/${iniAno}`;
  const fim = atual ? 'Atual' : `${fimMes}/${fimAno}`;
  return `${ini} - ${fim}`;
}

// Divide uma string de período válida em partes (mês/ano inicial e final).
function splitPeriod(v: string) {
  const m = v.match(
    /^(0[1-9]|1[0-2])\/(\d{4})\s-\s((0[1-9]|1[0-2])\/(\d{4})|Atual)$/,
  );
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

// Arrays auxiliares: meses (01 a 12) e anos (do ano atual - 60 até atual).
const MESES = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, '0'),
);
const ANOS = Array.from({ length: 60 }, (_, k) =>
  String(new Date().getFullYear() - k),
);

// Componente principal: renders selects de mês/ano inicial e final.
export default function PeriodPicker({
  value,
  onChange,
  label = 'Período',
  required,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
}) {
  // Divide o valor atual em partes.
  const parts = useMemo(() => splitPeriod(value), [value]);

  // Atualiza o valor quando o usuário altera qualquer campo.
  const set = (next: Partial<ReturnType<typeof splitPeriod>>) => {
    const merged = { ...parts, ...next };
    const built = buildPeriod({
      iniMes: merged.iniMes,
      iniAno: merged.iniAno,
      fimMes: merged.atual ? undefined : merged.fimMes,
      fimAno: merged.atual ? undefined : merged.fimAno,
      atual: merged.atual,
    });
    const inicioOk = merged.iniMes && merged.iniAno;
    const fimOk = merged.atual || (merged.fimMes && merged.fimAno);
    if (inicioOk && fimOk && isValidPeriod(built)) onChange(built);
    else onChange('');
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-center">
        {/* Select do mês inicial */}
        <select
          className="border rounded p-2"
          value={parts.iniMes}
          onChange={(e) => set({ iniMes: e.target.value })}
        >
          <option value="">Mês inicial</option>
          {MESES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        {/* Select do ano inicial */}
        <select
          className="border rounded p-2"
          value={parts.iniAno}
          onChange={(e) => set({ iniAno: e.target.value })}
        >
          <option value="">Ano inicial</option>
          {ANOS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>

        {/* Checkbox de "Atual" */}
        <div className="col-span-2 flex items-center gap-2">
          <input
            id="atual"
            type="checkbox"
            checked={parts.atual}
            onChange={(e) => set({ atual: e.target.checked })}
          />
          <label htmlFor="atual" className="text-sm">
            Atual
          </label>
        </div>

        {/* Selects de mês/ano final (só aparecem se não for Atual) */}
        {!parts.atual && (
          <>
            <select
              className="border rounded p-2"
              value={parts.fimMes}
              onChange={(e) => set({ fimMes: e.target.value })}
            >
              <option value="">Mês final</option>
              {MESES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <select
              className="border rounded p-2"
              value={parts.fimAno}
              onChange={(e) => set({ fimAno: e.target.value })}
            >
              <option value="">Ano final</option>
              {ANOS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
