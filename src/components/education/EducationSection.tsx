import React from 'react';
import { v4 as uuid } from 'uuid';
import EducationItem from '../education/EducationItem';
// ⬇️ se este arquivo está em src/components/education e o types.ts está em src/, use "../types"
import type { Education } from '../../types';
// (Se o seu types.ts estiver lado a lado de EducationSection.tsx, troque para "../types" -> "./types")

// --------------------------- Validação ---------------------------
// Garante que cada item tenha instituição, curso e período no formato aceito:
// "MM/YYYY - MM/YYYY" ou "MM/YYYY - Atual"
export function validateEducationItem(
  e: Education,
): Partial<Record<keyof Education, string>> {
  const errs: Partial<Record<keyof Education, string>> = {};

  if (!e.instituicao?.trim()) errs.instituicao = 'Informe a instituição';
  if (!e.curso?.trim()) errs.curso = 'Informe o curso';

  if (!e.periodo?.trim()) {
    errs.periodo = 'Informe o período';
  } else {
    const ok =
      /^(0[1-9]|1[0-2])\/(\d{4})\s-\s((0[1-9]|1[0-2])\/(\d{4})|Atual)$/.test(
        e.periodo,
      );
    if (!ok)
      errs.periodo =
        'Formato inválido (use MM/AAAA - MM/AAAA ou MM/AAAA - Atual)';
  }

  return errs;
}

// ---------------------- Lista de Formações -----------------------
export default function EducationSection({
  value,
  onChange,
}: {
  value: Education[];
  onChange: (next: Education[]) => void;
}) {
  const list = value ?? [];

  // Adiciona uma formação vazia com id único
  const addEdu = () => {
    const novo: Education = {
      id: uuid(),
      instituicao: '',
      curso: '',
      periodo: '',
    };
    onChange([...list, novo]);
  };

  // Remove pelo id
  const removeEdu = (id: string) => onChange(list.filter((e) => e.id !== id));

  // Atualiza o item no índice i
  const updateEdu = (i: number, next: Education) => {
    const draft = [...list];
    draft[i] = next;
    onChange(draft);
  };

  // Calcula erros por item (validação de campo)
  const errors = (e: Education) => validateEducationItem(e);

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">
          Formação Acadêmica
        </h3>
        <button
          type="button"
          className="btn btn-ghost border px-3 py-2 rounded-lg hover:bg-slate-50"
          onClick={addEdu}
          aria-label="Adicionar formação"
        >
          + Adicionar
        </button>
      </div>

      {/* Estado vazio elegante */}
      {list.length === 0 && (
        <div className="rounded-xl border bg-white/60 p-4 text-sm text-slate-600">
          Nenhuma formação adicionada.
          <button
            type="button"
            onClick={addEdu}
            className="ml-2 underline underline-offset-2 hover:text-emerald-700"
          >
            Adicionar agora
          </button>
        </div>
      )}

      {/* Lista de cards */}
      <div className="space-y-3">
        {list.map((e, i) => (
          <EducationItem
            key={e.id || `edu-${i}`}
            item={e}
            index={i}
            onChange={(next) => updateEdu(i, next)}
            onRemove={removeEdu}
            errors={errors(e)}
          />
        ))}
      </div>
    </section>
  );
}
