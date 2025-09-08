// src/components/experience/ExperienceItem.new.tsx
// -----------------------------------------------------------------------------
// Card de experiência com IA padronizada (ImproveButton) + efeito de loading.
// - Usa o mesmo fluxo de IA dos outros forms (improveText → /api/ai/improve).
// - Efeito visual enquanto gera (shimmer no textarea + badge flutuante).
// - maxDesc default = 160 (altere se quiser).
// -----------------------------------------------------------------------------

import { useState } from 'react';
import PeriodPicker from '../education/PeriodPicker';
import ImproveButton from '../ImproveButton'; // ✅ IA padronizada
import type { Experience } from '../../types';

// ----------------------------- Tipagens -----------------------------
type Props = {
  item: Experience;
  index: number;
  onChange: (next: Experience) => void;
  onRemove: (id: string) => void;
  errors?: Partial<
    Record<keyof Experience | 'empresa' | 'cargo' | 'periodo', string>
  >;
  /** Limite de caracteres do campo descrição (default 160). */
  maxDesc?: number;
};

// ----------------------------- Utils -----------------------------
/** Formata "Cidade UF" → "Cidade - UF" (ou mantém se já tiver traço) */
export function normalizeCidadeEstado(s: string): string {
  const v = (s || '').trim();
  if (v.includes('-')) return v.replace(/\s*-\s*/, ' - ');
  const m = /^(.+?)\s+([A-Za-z]{2})$/.exec(v);
  if (m) return `${m[1]} - ${m[2].toUpperCase()}`;
  return v;
}

/** Spinner minimalista para o badge */
function Spinner({ className = 'h-3 w-3' }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
      />
    </svg>
  );
}

// ----------------------------- Componente -----------------------------
export default function ExperienceItem({
  item,
  index,
  onChange,
  onRemove,
  errors = {},
  maxDesc = 160, // 👈 feeling similar ao Objetivo
}: Props) {
  const set = (patch: Partial<Experience>) => onChange({ ...item, ...patch });

  const [descLen, setDescLen] = useState(item.descricao?.length ?? 0);
  const [improving, setImproving] = useState(false); // sincroniza com ImproveButton

  const hasErr = !!errors.empresa || !!errors.cargo || !!errors.periodo;

  return (
    <div
      className={`rounded-2xl border p-4 space-y-4 bg-white/80 ${hasErr ? 'ring-1 ring-red-300' : ''}`}
      aria-busy={improving ? 'true' : 'false'}
    >
      {/* Cabeçalho do card */}
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-slate-800">
          Experiência #{index + 1}
        </h4>
        <button
          type="button"
          className="text-sm text-slate-500 hover:text-red-600"
          onClick={() => onRemove(item.id)}
          aria-label={`Remover experiência ${index + 1}`}
          title="Remover"
        >
          Remover
        </button>
      </div>

      {/* Grid de campos (empresa/cargo/período/descrição) */}
      <div className="grid md:grid-cols-2 gap-3">
        {/* Empresa */}
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

        {/* Cargo */}
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

        {/* Período — 2 colunas para alinhar com Educação */}
        <div className="md:col-span-2">
          <PeriodPicker
            value={item.periodo ?? ''}
            onChange={(v) => set({ periodo: v, atual: /\bAtual$/.test(v) })}
            allowOpenEnded
            error={errors.periodo as string | undefined}
          />
        </div>

        {/* Descrição + IA */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between">
            <label htmlFor={`xp-desc-${item.id}`} className="label">
              Descrição (opcional)
            </label>

            {/* ✅ ImproveButton: chama a IA real (mesmo fluxo dos outros forms) */}
            <ImproveButton
              value={item.descricao ?? ''}
              field="experiencia"
              onChange={(novo) => {
                const v = (novo ?? '').slice(0, maxDesc);
                set({ descricao: v });
                setDescLen(v.length);
              }}
              onLoadingChange={setImproving}
              meta={{
                context: [
                  item.cargo && `(${item.cargo})`,
                  item.empresa && `em ${item.empresa}`,
                  item.periodo,
                ]
                  .filter(Boolean)
                  .join(' '),
                maxChars: maxDesc,
                tone: 'profissional',
                locale: 'pt-BR',
              }}
            />
          </div>

          {/* Textarea com shimmer + badge flutuante enquanto gera */}
          <div className="relative">
            <textarea
              id={`xp-desc-${item.id}`}
              className={`input min-h-[112px] transition ${improving ? 'opacity-70 animate-pulse' : ''}`}
              maxLength={maxDesc}
              readOnly={improving}
              aria-readonly={improving ? 'true' : 'false'}
              value={item.descricao ?? ''}
              onChange={(e) => {
                const val = e.currentTarget.value.slice(0, maxDesc);
                set({ descricao: val });
                setDescLen(val.length);
              }}
              placeholder="Principais responsabilidades, tecnologias, resultados..."
            />
            {improving && (
              <span
                className="pointer-events-none absolute top-2 right-2 inline-flex items-center gap-2 rounded-full bg-slate-800/90 px-3 py-1 text-xs text-white shadow"
                aria-live="polite"
              >
                <Spinner />
                IA melhorando…
              </span>
            )}
          </div>

          <div className="text-[11px] text-slate-500 mt-1">
            {descLen}/{maxDesc}
          </div>
        </div>
      </div>
    </div>
  );
}
