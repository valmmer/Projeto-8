import React from 'react';
import PeriodPicker from './PeriodPicker';
import type { Education } from './types';

// Componente que representa UM item de formação (Education).
export default function EducationItem({
  item,
  onChange,
  onRemove,
  index,
  errors = {},
}: {
  item: Education;
  index: number;
  onChange: (next: Education) => void; // Atualiza esse item
  onRemove: (id: string) => void; // Remove esse item
  errors?: Partial<Record<keyof Education, string>>; // Erros de validação
}) {
  // Atualiza parte do objeto mantendo o resto.
  const set = (patch: Partial<Education>) => onChange({ ...item, ...patch });

  return (
    <div className="rounded-2xl border p-4 space-y-3 bg-white/70">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Formação #{index + 1}</h4>
        <button
          type="button"
          className="text-sm text-red-600 hover:underline"
          onClick={() => onRemove(item.id)}
        >
          Remover
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {/* Instituição */}
        <div>
          <label className="text-sm font-medium">Instituição *</label>
          <input
            className="border rounded p-2 w-full"
            value={item.instituicao}
            onChange={(e) => set({ instituicao: e.target.value })}
          />
          {errors.instituicao && (
            <p className="text-xs text-red-600">{errors.instituicao}</p>
          )}
        </div>

        {/* Curso */}
        <div>
          <label className="text-sm font-medium">Curso *</label>
          <input
            className="border rounded p-2 w-full"
            value={item.curso}
            onChange={(e) => set({ curso: e.target.value })}
          />
          {errors.curso && (
            <p className="text-xs text-red-600">{errors.curso}</p>
          )}
        </div>

        {/* Cidade (opcional) */}
        <div>
          <label className="text-sm font-medium">Cidade</label>
          <input
            className="border rounded p-2 w-full"
            value={item.cidade ?? ''}
            onChange={(e) => set({ cidade: e.target.value })}
          />
        </div>

        {/* Período (usa o componente PeriodPicker) */}
        <PeriodPicker
          value={item.periodo}
          onChange={(v) => set({ periodo: v })}
          label="Período"
          required
          error={errors.periodo}
        />
      </div>
    </div>
  );
}
