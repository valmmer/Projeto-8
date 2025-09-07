// src/components/experience/ExperienceSection.tsx
// -----------------------------------------------------------------------------
// Lista de experiências: adiciona / edita / remove vários <ExperienceItem />
// • Validação: empresa*, cargo*, período válido (MM/AAAA - MM/AAAA | MM/AAAA - Atual)
// • Cria itens com `atual: false` por padrão
// -----------------------------------------------------------------------------

import React from 'react';
import ExperienceItem from './ExperienceItem';
import type { Experience } from '../../types';
import { rid } from '../../state/ResumeContext';

type Props = {
  value: Experience[] | undefined;
  onChange: (next: Experience[]) => void;
};

const RE_PERIOD =
  /^(0[1-9]|1[0-2])\/(\d{4})\s-\s((0[1-9]|1[0-2])\/(\d{4})|Atual)$/;

function validateItem(e: Experience): Partial<Record<string, string>> {
  const err: Partial<Record<string, string>> = {};
  if (!e.empresa?.trim()) err.empresa = 'Informe a empresa.';
  if (!e.cargo?.trim()) err.cargo = 'Informe o cargo.';
  if (!e.periodo?.trim() || !RE_PERIOD.test(e.periodo)) {
    err.periodo = 'Use "MM/AAAA - MM/AAAA" ou "MM/AAAA - Atual".';
  }
  return err;
}

export default function ExperienceSection({ value, onChange }: Props) {
  const list = Array.isArray(value) ? value : [];

  const addExp = () => {
    const novo: Experience = {
      id: rid(),
      empresa: '',
      cargo: '',
      localidade: '',
      periodo: '',
      atual: false, // ✅ campo exigido pelo seu types.Experience
      descricao: '',
    };
    onChange([...list, novo]);
  };

  const removeExp = (id: string) => onChange(list.filter((e) => e.id !== id));

  const updateExp = (idx: number, next: Experience) => {
    const copy = [...list];
    copy[idx] = next;
    onChange(copy);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Experiência Profissional</h3>
        <button
          type="button"
          className="btn btn-subtle"
          onClick={addExp}
          aria-label="Adicionar experiência"
        >
          + Adicionar
        </button>
      </div>

      {list.length === 0 && (
        <div className="rounded-xl border px-4 py-3 text-sm text-neutral-700">
          Nenhuma experiência adicionada.{' '}
          <button className="underline text-blue-700" onClick={addExp}>
            Adicionar agora
          </button>
        </div>
      )}

      <div className="space-y-3">
        {list.map((e, i) => (
          <ExperienceItem
            key={e.id ?? `xp-${i}`}
            item={e}
            index={i}
            onChange={(next) => updateExp(i, next)}
            onRemove={removeExp}
            errors={validateItem(e)}
          />
        ))}
      </div>
    </section>
  );
}
