import React from 'react';
import { v4 as uuid } from 'uuid';
import EducationItem from './EducationItem';
import type { Education } from './types';

// Função que valida um item de Education e retorna erros por campo.
export function validateEducationItem(
  e: Education,
): Partial<Record<keyof Education, string>> {
  const errs: Partial<Record<keyof Education, string>> = {};
  if (!e.instituicao?.trim()) errs.instituicao = 'Informe a instituição';
  if (!e.curso?.trim()) errs.curso = 'Informe o curso';
  if (!e.periodo?.trim()) errs.periodo = 'Informe o período';
  else {
    const ok =
      /^(0[1-9]|1[0-2])\/(\d{4})\s-\s((0[1-9]|1[0-2])\/(\d{4})|Atual)$/.test(
        e.periodo,
      );
    if (!ok) errs.periodo = 'Formato inválido';
  }
  return errs;
}

// Componente que gerencia a lista de formações.
export default function EducationSection({
  value,
  onChange,
}: {
  value: Education[];
  onChange: (next: Education[]) => void;
}) {
  // Adiciona uma nova formação (com uuid).
  const addEdu = () => {
    const novo: Education = {
      id: uuid(),
      instituicao: '',
      curso: '',
      cidade: '',
      periodo: '',
    };
    onChange([...(value ?? []), novo]);
  };

  // Remove pelo id.
  const removeEdu = (id: string) =>
    onChange((value ?? []).filter((e) => e.id !== id));

  // Atualiza um item específico.
  const updateEdu = (i: number, next: Education) => {
    const draft = [...(value ?? [])];
    draft[i] = next;
    onChange(draft);
  };

  const errors = (e: Education) => validateEducationItem(e);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Formação Acadêmica</h3>
        <button
          type="button"
          className="rounded-lg border px-3 py-2 hover:bg-gray-50"
          onClick={addEdu}
        >
          + Adicionar
        </button>
      </div>

      {(value ?? []).length === 0 && (
        <p className="text-sm text-gray-600">Nenhuma formação adicionada.</p>
      )}

      <div className="space-y-3">
        {(value ?? []).map((e, i) => (
          <EducationItem
            key={e.id}
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
