// src/components/education/EducationItem.tsx
// -----------------------------------------------------------------------------
// Cartão de formação (com checkbox "Ensino Médio")
// • Suporta ANOS FUTUROS (padrão: atual + 10) — configurável via prop futureYears
// • Se o usuário escolher um ANO FUTURO com status "Completo", forçamos "Incompleto"
//   para evitar inconsistências (e atualizamos o rótulo do "Ensino Médio").
// • Situação: Completo | Incompleto
//   - Completo   → "Concluído em YYYY"
//   - Incompleto → "Término em YYYY"
// • Instituição* obrigatória
// -----------------------------------------------------------------------------

import { useEffect, useMemo, useState } from 'react';
import type { Education } from '../../types';

type Props = {
  item: Education;
  index: number;
  onChange: (next: Education) => void;
  onRemove: (id: string) => void;
  errors?: Partial<Record<keyof Education, string>>;
  /** Quantos anos à frente do atual exibir no seletor. Default: 10 */
  futureYears?: number;
  /** Quantos anos para trás a partir do atual. Default: 60 */
  pastYears?: number;
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
  futureYears = 5,
  pastYears = 60,
}: Props) {
  const set = (patch: Partial<Education>) => onChange({ ...item, ...patch });

  const nowYear = new Date().getFullYear();
  const yMax = nowYear + Math.max(0, futureYears);
  const yMin = nowYear - Math.max(0, pastYears);

  // anos descendentes: yMax → yMin
  const years = useMemo(() => {
    const out: string[] = [];
    for (let y = yMax; y >= yMin; y--) out.push(String(y));
    return out;
  }, [yMax, yMin]);

  // --- Detecção robusta do "Ensino Médio" (ignora acento/maiúsculas/espaços) ---
  function normalizeStr(s?: string) {
    return (
      (s || '')
        .normalize('NFD')
        // @ts-ignore - \p{Diacritic} requer flag 'u' em runtimes modernos
        .replace(/\p{Diacritic}/gu, '')
        .trim()
        .toLowerCase()
    );
  }
  const isMedio = normalizeStr(item.curso).startsWith('ensino medio');

  // status/ano derivados do período atual
  const derivedStatus = deriveStatus(item.periodo);
  const year = extractYear(item.periodo);

  // status controlado localmente enquanto não há ano
  const [pendingStatus, setPendingStatus] = useState<'Completo' | 'Incompleto'>(
    derivedStatus,
  );

  // Sempre que o período tiver ano, sincroniza o pendingStatus com o derivado
  useEffect(() => {
    if (year) setPendingStatus(derivedStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.periodo]);

  // Rótulo de status efetivo para esta renderização
  const statusNow: 'Completo' | 'Incompleto' = year
    ? derivedStatus
    : pendingStatus;

  // Helpers para rótulo do Médio
  const medioLabel = (status: 'Completo' | 'Incompleto') =>
    `Ensino Médio (${status})`;

  // Atualiza o texto do curso quando JÁ for Ensino Médio
  function syncMedioLabelIfMedio(status: 'Completo' | 'Incompleto') {
    if (isMedio) set({ curso: medioLabel(status) });
  }

  // Alterna o checkbox "Ensino Médio"
  function toggleMedio(checked: boolean) {
    if (checked) {
      // Força escrever o label do Médio para passar a ser reconhecido na próxima render
      set({ curso: medioLabel(statusNow) });
    } else {
      // volta a ser Superior/Curso livre → limpa para o usuário digitar
      set({ curso: '' });
    }
  }

  // Muda Situação
  function handleStatusChange(next: 'Completo' | 'Incompleto') {
    // Se já tem ano FUTURO e usuário escolhe "Completo", força "Incompleto"
    const nextFinal =
      next === 'Completo' && year && Number(year) > nowYear
        ? 'Incompleto'
        : next;

    setPendingStatus(nextFinal);
    // atualiza rótulo do Médio somente se já for Médio
    syncMedioLabelIfMedio(nextFinal);

    // Se já tiver ano, reescreve o período com o novo rótulo
    if (year) {
      set({
        periodo:
          nextFinal === 'Completo'
            ? `Concluído em ${year}`
            : `Término em ${year}`,
      });
    } else {
      // sem ano ainda → mantém período vazio
      set({ periodo: '' });
    }
  }

  // Muda Ano
  function handleYearChange(nextYear: string) {
    if (!nextYear) {
      set({ periodo: '' });
      return;
    }

    // Se o ano é FUTURO e o status atual é "Completo", corrige para "Incompleto"
    const isFuture = Number(nextYear) > nowYear;
    const normalizedStatus =
      statusNow === 'Completo' && isFuture ? 'Incompleto' : statusNow;

    // Mantém o pendingStatus coerente
    if (!year && normalizedStatus !== pendingStatus) {
      setPendingStatus(normalizedStatus);
    }
    // Atualiza rótulo do Médio, se aplicável
    syncMedioLabelIfMedio(normalizedStatus);

    set({
      periodo:
        normalizedStatus === 'Completo'
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
              {medioLabel(statusNow)}
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
            value={statusNow}
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
            {statusNow === 'Completo'
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
          {/* Dica opcional quando ano futuro + status completo não combinam */}
          {year && Number(year) > nowYear && statusNow === 'Completo' && (
            <p className="help text-amber-600">
              Ano no futuro selecionado — ajustando situação para “Incompleto”.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
