// src/components/experience/ExperienceItem.tsx
// -----------------------------------------------------------------------------
// Card de experiência profissional (layout padronizado + IA na descrição)
// • Empresa *  |  Cargo *
// • Localidade: "Cidade - Estado" (traço automático)
// • Período *: <PeriodPicker> (MM/AAAA - MM/AAAA | MM/AAAA - Atual)
//   → sincroniza também o booleano `atual` do tipo Experience
// • Descrição (opcional) com contador + botão ✨ Melhorar (IA ou fallback local)
// -----------------------------------------------------------------------------

import React, { useMemo, useState } from 'react';
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
  /** (Opcional) Se você já tem um serviço de IA, injete aqui.
   * Deve retornar um texto melhorado baseado na descrição atual e contexto. */
  aiImprove?: (input: {
    descricaoAtual: string;
    empresa?: string;
    cargo?: string;
    periodo?: string;
  }) => Promise<string>;
};

export function normalizeCidadeEstado(s: string): string {
  const v = (s || '').trim();
  if (v.includes('-')) return v.replace(/\s*-\s*/, ' - ');
  const m = /^(.+?)\s+([A-Za-z]{2})$/.exec(v);
  if (m) return `${m[1]} - ${m[2].toUpperCase()}`;
  return v;
}

/** Fallback simples quando não há IA externa */
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
    // deixa mais direto: tira rodeios comuns e garante ponto final
    let out = base
      .replace(/^Atuei\s+como\s+/i, '')
      .replace(/^Responsável\s+por\s+/i, '')
      .replace(/\s*–\s*/g, ' - ')
      .trim();
    if (!/[.!?]$/.test(out)) out += '.';
    return out;
  }

  // gera uma base quando está vazio/curto
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
}: Props) {
  const set = (patch: Partial<Experience>) => onChange({ ...item, ...patch });

  const [descLen, setDescLen] = useState(item.descricao?.length ?? 0);
  const [improving, setImproving] = useState(false);
  const maxDesc = 400;

  const years = useMemo(() => {
    const now = new Date().getFullYear();
    return Array.from({ length: 61 }, (_, i) => String(now - i));
  }, []);

  const hasErr = !!errors.empresa || !!errors.cargo || !!errors.periodo;

  async function handleImprove() {
    try {
      setImproving(true);
      const payload = {
        descricaoAtual: item.descricao ?? '',
        empresa: item.empresa,
        cargo: item.cargo,
        periodo: item.periodo,
      };
      let improved = '';
      if (aiImprove) {
        // ✅ Usa IA externa se fornecida
        improved = (await aiImprove(payload)) ?? '';
      } else {
        // ✅ Fallback local (heurístico)
        improved = improveLocal(payload);
      }
      // aplica limite e atualiza estado
      improved = improved.trim().slice(0, maxDesc);
      set({ descricao: improved });
      setDescLen(improved.length);
    } catch {
      // silencioso; você pode exibir um toast se tiver no projeto
    } finally {
      setImproving(false);
    }
  }

  return (
    <div
      className={`rounded-2xl border p-4 space-y-4 bg-white/80 ${
        hasErr ? 'ring-1 ring-red-300' : ''
      }`}
    >
      {/* Cabeçalho */}
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

      {/* Grid padronizada */}
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

        {/* Localidade */}
        <div>
          <label htmlFor={`xp-loc-${item.id}`} className="label">
            Localidade
          </label>
          <input
            id={`xp-loc-${item.id}`}
            className="input"
            value={item.localidade ?? ''}
            // ✅ Deixa digitar livre (com espaços)
            onChange={(e) => set({ localidade: e.currentTarget.value })}
            // ✅ Normaliza só ao sair do campo
            onBlur={(e) =>
              set({ localidade: normalizeCidadeEstado(e.currentTarget.value) })
            }
            placeholder="Ex.: São Paulo - SP"
            inputMode="text"
            autoCapitalize="words"
          />
          <p className="help text-slate-500">
            Formato: Cidade - UF.
          </p>
        </div>

        {/* Período — 2 colunas para alinhar com Educação */}
        <div className="md:col-span-2">
          <label className="label">Período *</label>
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
            <button
              type="button"
              className="btn btn-subtle"
              onClick={handleImprove}
              disabled={improving}
              title="Gerar uma versão melhorada desta descrição"
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
              const val = e.currentTarget.value;
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
