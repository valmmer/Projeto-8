// src/components/education/EducationItem.tsx
// -----------------------------------------------------------------------------
// Cartão de formação (com checkbox "Ensino Médio")
// • Checkbox "Ensino Médio": quando marcado, o campo Curso vira apenas informativo
//   e salvamos "Ensino Médio (Completo|Incompleto)".
// • Situação: Completo | Incompleto
//   - Completo   → "Concluído em YYYY"
//   - Incompleto → "Término em YYYY"
// • Instituição* sempre obrigatória
// -----------------------------------------------------------------------------

import React, { useEffect, useMemo, useState } from 'react';
import type { Education } from '../../types';

type Props = {
  item: Education;
  index: number;
  onChange: (next: Education) => void;
  onRemove: (id: string) => void;
  errors?: Partial<Record<keyof Education, string>>;
};

// Extrai o primeiro ano (YYYY) do texto
function extractYear(s?: string): string {
  const m = /(\d{4})/.exec(s || '');
  return m ? m[1] : '';
}

// Deriva status pelo texto salvo no periodo
function deriveStatus(periodo?: string): 'Completo' | 'Incompleto' {
  return /T[ée]rmino/i.test(periodo || '') ? 'Incompleto' : 'Completo';
}

export default function EducationItem({
  item,
  index,
  onChange,
  onRemove,
  errors = {},
}: Props) {
  const set = (patch: Partial<Education>) => onChange({ ...item, ...patch });

  // anos (atual → atual-60)
  const years = useMemo(() => {
    const now = new Date().getFullYear();
    return Array.from({ length: 61 }, (_, i) => String(now - i));
  }, []);

  // é Ensino Médio se o curso começar com "Ensino Médio"
  const isMedio = /^Ensino Médio/i.test(item.curso || '');

  // status/ano derivados do período atual
  const derivedStatus = deriveStatus(item.periodo);
  const year = extractYear(item.periodo);

  // status controlado localmente enquanto não há ano
  const [pendingStatus, setPendingStatus] = useState<'Completo' | 'Incompleto'>(
    derivedStatus,
  );

  // sempre que o período tiver ano, sincroniza o pendingStatus com o derivado
  useEffect(() => {
    if (year) setPendingStatus(derivedStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.periodo]);

  // alterna o checkbox "Ensino Médio"
  function toggleMedio(checked: boolean) {
    if (checked) {
      // vira Ensino Médio → montamos o texto do curso com o status atual
      set({ curso: `Ensino Médio (${pendingStatus})` });
    } else {
      // volta a ser Superior/Curso livre → limpa para o usuário digitar
      set({ curso: '' });
    }
  }

  // muda Situação
  function handleStatusChange(next: 'Completo' | 'Incompleto') {
    setPendingStatus(next);

    // atualiza o "curso" se for Ensino Médio
    if (isMedio) {
      set({ curso: `Ensino Médio (${next})` });
    }

    // se já tiver ano, reescreve o período com o novo rótulo
    if (year) {
      set({
        periodo:
          next === 'Completo' ? `Concluído em ${year}` : `Término em ${year}`,
      });
    } else {
      // sem ano ainda → mantém período vazio
      set({ periodo: '' });
    }
  }

  // muda Ano
  function handleYearChange(nextYear: string) {
    if (!nextYear) {
      set({ periodo: '' });
      return;
    }
    const statusNow = (year ? derivedStatus : pendingStatus) || 'Completo';
    set({
      periodo:
        statusNow === 'Completo'
          ? `Concluído em ${nextYear}`
          : `Término em ${nextYear}`,
    });
  }

  const hasErr = !!errors.instituicao || !!errors.curso || !!errors.periodo;

  return (
    <div
      className={`rounded-2xl border p-4 space-y-4 bg-white/80 ${
        hasErr ? 'ring-1 ring-red-300' : ''
      }`}
    >
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-slate-800">Formação #{index + 1}</h4>
        <button
          type="button"
          className="text-sm text-slate-500 hover:text-red-600"
          onClick={() => onRemove(item.id)}
          aria-label={`Remover formação ${index + 1}`}
          title="Remover"
        >
          Remover
        </button>
      </div>

      {/* Checkbox Ensino Médio */}
      <div className="flex items-center gap-2">
        <input
          id={`edu-medio-${item.id}`}
          type="checkbox"
          checked={isMedio}
          onChange={(e) => toggleMedio(e.target.checked)}
        />
        <label htmlFor={`edu-medio-${item.id}`} className="text-sm">
          Ensino Médio
        </label>
      </div>

      {/* Grid (2 colunas no desktop) */}
      <div className="grid md:grid-cols-2 gap-3">
        {/* Instituição */}
        <div>
          <label htmlFor={`edu-inst-${item.id}`} className="label">
            Instituição *
          </label>
          <input
            id={`edu-inst-${item.id}`}
            className={`input ${
              errors.instituicao ? 'ring-2 ring-red-500 border-red-500' : ''
            }`}
            value={item.instituicao}
            onChange={(e) => set({ instituicao: e.target.value })}
            placeholder={
              isMedio
                ? 'Ex.: Colégio Estadual...'
                : 'Ex.: Universidade Federal...'
            }
          />
          {errors.instituicao && (
            <p className="help text-red-600">{errors.instituicao}</p>
          )}
        </div>

        {/* Curso */}
        <div>
          <label htmlFor={`edu-curso-${item.id}`} className="label">
            {isMedio ? 'Curso (fixo)' : 'Curso *'}
          </label>

          {isMedio ? (
            <div className="input bg-slate-50 text-slate-600">
              {`Ensino Médio (${(year ? derivedStatus : pendingStatus) || 'Completo'})`}
            </div>
          ) : (
            <input
              id={`edu-curso-${item.id}`}
              className={`input ${
                errors.curso ? 'ring-2 ring-red-500 border-red-500' : ''
              }`}
              value={item.curso}
              onChange={(e) => set({ curso: e.target.value })}
              placeholder="Ex.: Bacharelado em Sistemas de Informação"
            />
          )}

          {errors.curso && !isMedio && (
            <p className="help text-red-600">{errors.curso}</p>
          )}
        </div>

        {/* Situação */}
        <div>
          <label className="label">Situação</label>
          <select
            className="input"
            value={year ? derivedStatus : pendingStatus}
            onChange={(e) =>
              handleStatusChange(e.target.value as 'Completo' | 'Incompleto')
            }
          >
            <option value="Completo">Completo</option>
            <option value="Incompleto">Incompleto</option>
          </select>
          <p className="help text-slate-500">
            “Mês” não é necessário. Só o ano.
          </p>
        </div>

        {/* Ano */}
        <div>
          <label className="label">
            {(year ? derivedStatus : pendingStatus) === 'Completo'
              ? 'Ano de formação *'
              : 'Ano de término *'}
          </label>
          <select
            className={`input ${
              errors.periodo ? 'ring-2 ring-red-500 border-red-500' : ''
            }`}
            value={year}
            onChange={(e) => handleYearChange(e.target.value)}
          >
            <option value="">Ano</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          {errors.periodo && (
            <p className="help text-red-600">{errors.periodo}</p>
          )}
        </div>
      </div>
    </div>
  );
}
