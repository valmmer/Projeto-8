// src/components/experience/ExperienceItem.tsx
import { useState } from 'react';
import PeriodPicker from '../education/PeriodPicker';
import type { Experience } from '../../types';

type Props = {
  item: Experience;
  index: number;
  onChange: (next: Experience) => void;
  onRemove: (id: string) => void;
  errors?: Partial<
    Record<keyof Experience | 'empresa' | 'cargo' | 'periodo', string>
  >;
  /** IA opcional injetada pelo pai */
  aiImprove?: (input: {
    descricaoAtual: string;
    empresa?: string;
    cargo?: string;
    periodo?: string;
  }) => Promise<string>;
  /** Limite de caracteres da descrição (default 160) */
  maxDesc?: number;
};

export type ExperienceItemProps = Props; // 👈 exporta o tipo para o Section

function improveLocal({
  descricaoAtual,
  empresa,
  cargo,
  periodo,
}: {
  descricaoAtual: string;
  empresa?: string;
  cargo?: string;
  periodo?: string;
}) {
  const base = (descricaoAtual || '')
    .replace(/\s+/g, ' ')
    .replace(/\s*\.\s*/g, '. ')
    .trim();
  if (base.length >= 60) {
    let out = base
      .replace(/^Atuei\s+como\s+/i, '')
      .replace(/^Responsável\s+por\s+/i, '')
      .replace(/\s*–\s*/g, ' - ')
      .trim();
    if (!/[.!?]$/.test(out)) out += '.';
    return out;
  }
  const segs: string[] = [];
  if (cargo || empresa)
    segs.push(`${cargo ?? 'Profissional'} na ${empresa ?? 'empresa'}`);
  if (periodo) segs.push(periodo);
  const head = segs.filter(Boolean).join(' — ');
  const bullets = [
    'Principais responsabilidades: desenvolvimento, manutenção e suporte.',
    'Resultados: entregas no prazo, melhoria de performance e qualidade.',
    'Tecnologias: defina as principais stacks e ferramentas.',
  ];
  return `${head}\n• ${bullets.join('\n• ')}`;
}

export default function ExperienceItem({
  item,
  index,
  onChange,
  onRemove,
  errors = {},
  aiImprove,
  maxDesc = 160,
}: Props) {
  const set = (patch: Partial<Experience>) => onChange({ ...item, ...patch });

  const [descLen, setDescLen] = useState(item.descricao?.length ?? 0);
  const [improving, setImproving] = useState(false);

  async function handleImprove() {
    try {
      setImproving(true);
      const payload = {
        descricaoAtual: item.descricao ?? '',
        empresa: item.empresa,
        cargo: item.cargo,
        periodo: item.periodo,
      };
      const improved =
        (aiImprove
          ? await aiImprove(payload)
          : improveLocal(payload)
        )?.trim() ?? '';
      const sliced = improved.slice(0, maxDesc);
      set({ descricao: sliced });
      setDescLen(sliced.length);
    } finally {
      setImproving(false);
    }
  }

  const hasErr = !!errors.empresa || !!errors.cargo || !!errors.periodo;

  return (
    <div
      className={`rounded-2xl border p-4 space-y-4 bg-white/80 ${hasErr ? 'ring-1 ring-red-300' : ''}`}
    >
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-slate-800">
          Experiência #{index + 1}
        </h4>
        <button
          type="button"
          className="text-sm text-slate-500 hover:text-red-600"
          onClick={() => onRemove(item.id)}
        >
          Remover
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label htmlFor={`xp-emp-${item.id}`} className="label">
            Empresa *
          </label>
          <input
            id={`xp-emp-${item.id}`}
            className={`input ${errors.empresa ? 'ring-2 ring-red-500 border-red-500' : ''}`}
            value={item.empresa ?? ''}
            onChange={(e) => set({ empresa: e.currentTarget.value })}
            placeholder="Ex.: ACME Ltda."
          />
          {errors.empresa && (
            <p className="help text-red-600">{errors.empresa}</p>
          )}
        </div>

        <div>
          <label htmlFor={`xp-role-${item.id}`} className="label">
            Cargo *
          </label>
          <input
            id={`xp-role-${item.id}`}
            className={`input ${errors.cargo ? 'ring-2 ring-red-500 border-red-500' : ''}`}
            value={item.cargo ?? ''}
            onChange={(e) => set({ cargo: e.currentTarget.value })}
            placeholder="Ex.: Desenvolvedor Front-end"
          />
          {errors.cargo && <p className="help text-red-600">{errors.cargo}</p>}
        </div>

        <div className="md:col-span-2">
          <PeriodPicker
            value={item.periodo ?? ''}
            onChange={(v) => set({ periodo: v, atual: /\bAtual$/.test(v) })}
            allowOpenEnded
            error={errors.periodo as string | undefined}
          />
        </div>

        <div className="md:col-span-2">
          <div className="flex items-center justify-between">
            <label htmlFor={`xp-desc-${item.id}`} className="label">
              Descrição (opcional)
            </label>
            <button
              type="button"
              className="btn btn-subtle"
              onClick={handleImprove}
              disabled={improving}
            >
              {improving ? 'Gerando…' : '✨ Melhorar'}
            </button>
          </div>

          <textarea
            id={`xp-desc-${item.id}`}
            className="input min-h-[96px]"
            maxLength={maxDesc}
            value={item.descricao ?? ''}
            onChange={(e) => {
              const val = e.currentTarget.value.slice(0, maxDesc);
              set({ descricao: val });
              setDescLen(val.length);
            }}
            placeholder="Principais responsabilidades, tecnologias, resultados..."
          />
          <div className="text-[11px] text-slate-500 mt-1">
            {descLen}/{maxDesc}
          </div>
        </div>
      </div>
    </div>
  );
}
