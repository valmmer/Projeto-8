// src/components/education/PeriodPicker.tsx
import { useEffect, useMemo, useState } from 'react';

type Props = {
  /** "MM/AAAA - MM/AAAA" | "MM/AAAA - Atual" | "" */
  value: string;
  onChange: (v: string) => void;
  /** Mostra o checkbox "Até o momento" (open-ended). Default: true */
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

type Draft = {
  sm: string; // start month
  sy: string; // start year
  em: string; // end month
  ey: string; // end year
  isOpen: boolean; // "Até o momento"
};

function parseValue(v: string): Draft {
  const m = RE_PERIOD.exec(v || '');
  if (!m) return { sm: '', sy: '', em: '', ey: '', isOpen: false };
  const sm = m[1],
    sy = m[2];
  const right = m[3];
  if (right === 'Atual') return { sm, sy, em: '', ey: '', isOpen: true };
  const em = m[4],
    ey = m[5];
  return { sm, sy, em, ey, isOpen: false };
}

function buildValue(d: Draft): string | '' {
  if (!d.sm || !d.sy) return '';
  if (d.isOpen) return `${d.sm}/${d.sy} - Atual`;
  if (!d.em || !d.ey) return '';
  return `${d.sm}/${d.sy} - ${d.em}/${d.ey}`;
}

export default function PeriodPicker({
  value,
  onChange,
  allowOpenEnded = true,
  error,
  minYear,
  maxYear,
}: Props) {
  const anoAtual = new Date().getFullYear();
  const yMin = minYear ?? anoAtual - 60;
  const yMax = maxYear ?? anoAtual;

  const months = useMemo(
    () => Array.from({ length: 12 }, (_, i) => pad2(i + 1)),
    [],
  );
  const years = useMemo(() => {
    const out: string[] = [];
    for (let y = yMax; y >= yMin; y--) out.push(String(y));
    return out;
  }, [yMin, yMax]);

  // ---------- estado interno (rascunho) ----------
  const [draft, setDraft] = useState<Draft>(() => parseValue(value));

  // Sincroniza rascunho se "value" externo mudar (ex.: reset do form)
  useEffect(() => {
    setDraft(parseValue(value));
  }, [value]);

  // Atualiza rascunho e emite quando houver dados suficientes
  function update(next: Partial<Draft>) {
    setDraft((prev) => {
      const d = { ...prev, ...next };
      const built = buildValue(d);
      if (built && built !== value) onChange(built);
      // Mesmo quando incompleto, mantemos no estado interno para os selects não “voltarem”
      return d;
    });
  }

  // Handlers
  const onSm = (v: string) => update({ sm: v });
  const onSy = (v: string) => update({ sy: v });
  const onEm = (v: string) => update({ em: v, isOpen: false });
  const onEy = (v: string) => update({ ey: v, isOpen: false });
  // Substitua seu onOpen atual por este:
  const onOpen = (checked: boolean) => {
    setDraft((prev) => {
      const next = {
        ...prev,
        isOpen: checked,
        em: checked ? '' : prev.em,
        ey: checked ? '' : prev.ey,
      };

      const built = buildValue(next);

      if (checked) {
        // Marcou como Atual → salva "... - Atual" (se já houver início)
        if (built && built !== value) onChange(built);
      } else {
        // Desmarcou "Atual"
        const tinhaAtual = /-\s*Atual$/.test(value || '');
        const temFim = !!(next.em && next.ey);

        if (tinhaAtual && !temFim) {
          // não há fim escolhido ainda → limpa o período para sumir do preview
          if (value) onChange('');
        } else {
          // já há fim completo → emite o novo período
          if (built && built !== value) onChange(built);
        }
      }

      return next;
    });
  };

  return (
    <fieldset className="space-y-2">
      {/* Cabeçalho: título + botão "Atual" centralizado */}
      <div className="flex flex-col items-center gap-3">
        <legend className="label text-emerald-700">Período *</legend>

        {allowOpenEnded && (
          <button
            type="button"
            onClick={() => onOpen(!draft.isOpen)}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition
        ${
          draft.isOpen
            ? 'bg-emerald-600 text-white shadow-md'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        }`}
          >
            {draft.isOpen ? 'Marcado como Atual' : 'Marcar como Atual'}
          </button>
        )}
      </div>

      {/* Grade dos selects */}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        {/* Início (mês) */}
        <div>
          <label className="label">Início (mês)</label>
          <select
            className="input"
            value={draft.sm}
            onChange={(e) => onSm(e.target.value)}
            aria-label="Mês de início"
          >
            <option value="">Mês…</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Início (ano) */}
        <div>
          <label className="label">Início (ano)</label>
          <select
            className="input"
            value={draft.sy}
            onChange={(e) => onSy(e.target.value)}
            aria-label="Ano de início"
          >
            <option value="">Ano…</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Fim (mês) */}
        <div>
          <label className="label">Fim (mês)</label>
          <select
            className={`input ${allowOpenEnded && draft.isOpen ? 'opacity-60' : ''}`}
            value={draft.isOpen ? '' : draft.em}
            onChange={(e) => onEm(e.target.value)}
            disabled={allowOpenEnded && draft.isOpen}
            aria-label="Mês de término"
          >
            <option value="">Mês…</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Fim (ano) */}
        <div>
          <label className="label">Fim (ano)</label>
          <select
            className={`input ${allowOpenEnded && draft.isOpen ? 'opacity-60' : ''}`}
            value={draft.isOpen ? '' : draft.ey}
            onChange={(e) => onEy(e.target.value)}
            disabled={allowOpenEnded && draft.isOpen}
            aria-label="Ano de término"
          >
            <option value="">Ano…</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Rodapé: ajuda + erro */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs text-slate-500">Formato: MM/AAAA.</p>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </fieldset>
  );
}
