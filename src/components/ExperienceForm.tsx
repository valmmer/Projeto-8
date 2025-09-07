// src/components/ExperienceForm.tsx
// -----------------------------------------------------------------------------
// Lista/edição de experiências profissionais
// • "+ Adicionar" cria item com campos padrão
// • Cada item usa <ExperienceItem /> (com PeriodPicker)
// • Validação leve por item: empresa*, cargo*, período* (MM/AAAA - MM/AAAA | ... - Atual)
// • Atualização em-lugar usando dispatch({ type: 'HYDRATE', payload })
// -----------------------------------------------------------------------------

import React from 'react';
import { useResume, rid } from '../state/ResumeContext';
import type { Experience, ResumeState } from '../types';
import ExperienceItem from './experience/ExperienceItem';
import Button from './ui/Button';

// mesma regex do PeriodPicker
const RE_PERIOD =
  /^(0[1-9]|1[0-2])\/(\d{4})\s-\s((0[1-9]|1[0-2])\/(\d{4})|Atual)$/;

function validateItem(e: Experience) {
  const errors: Partial<
    Record<keyof Experience | 'empresa' | 'cargo' | 'periodo', string>
  > = {};
  if (!e.empresa?.trim()) errors.empresa = 'Informe a empresa.';
  if (!e.cargo?.trim()) errors.cargo = 'Informe o cargo.';
  if (!e.periodo?.trim() || !RE_PERIOD.test(e.periodo)) {
    errors.periodo = 'Use "MM/AAAA - MM/AAAA" ou "MM/AAAA - Atual".';
  }
  return errors;
}

export default function ExperienceForm() {
  const { state, dispatch } = useResume();
  const list = state.experiencias ?? [];

  // Atualiza a lista em-lugar via HYDRATE (evita reordenar)
  const commit = (nextList: Experience[]) => {
    const nextState: ResumeState = { ...state, experiencias: nextList };
    dispatch({ type: 'HYDRATE', payload: nextState });
  };

  const add = () => {
    const novo: Experience = {
      id: rid(),
      empresa: '',
      cargo: '',
      localidade: '',
      periodo: '',
      atual: false, // mantém compat com seu types
      descricao: '',
    };
    commit([...list, novo]);
  };

  const remove = (id: string) => {
    commit(list.filter((x) => x.id !== id));
  };

  const updateAt = (idx: number, next: Experience) => {
    const draft = [...list];
    draft[idx] = next;
    commit(draft);
  };

  return (
    <section className="space-y-4">
      {/* cabeçalho */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Experiência Profissional</h3>
        <Button
          variant="subtle"
          onClick={add}
          aria-label="Adicionar experiência"
        >
          + Adicionar
        </Button>
      </div>

      {/* estado vazio */}
      {list.length === 0 && (
        <div className="rounded-xl border bg-white/60 p-4 text-sm text-slate-600">
          Nenhuma experiência adicionada.&nbsp;
          <button
            type="button"
            className="underline underline-offset-2 hover:text-emerald-700"
            onClick={add}
          >
            Adicionar agora
          </button>
        </div>
      )}

      {/* lista de cards */}
      <div className="space-y-3">
        {list.map((item, i) => (
          <ExperienceItem
            key={item.id || `xp-${i}`}
            item={item}
            index={i}
            onChange={(next) => updateAt(i, next)}
            onRemove={remove}
            errors={validateItem(item)}
          />
        ))}
      </div>
    </section>
  );
}
