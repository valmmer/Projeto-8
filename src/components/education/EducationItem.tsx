import React from 'react';
import PeriodPicker from '../education/PeriodPicker';
import type { Education } from './types';

type Props = {
  item: Education;
  index: number;
  onChange: (next: Education) => void;
  onRemove: (id: string) => void;
  errors?: Partial<Record<keyof Education, string>>;
};

export default function EducationItem({
  item,
  onChange,
  onRemove,
  index,
  errors = {},
}: Props) {
  const set = (patch: Partial<Education>) => onChange({ ...item, ...patch });
  const hasErr = !!(errors.instituicao || errors.curso || errors.periodo);

  return (
    <div
      className={`rounded-2xl border p-4 space-y-4 bg-white/80 ${hasErr ? 'ring-1 ring-red-300' : ''}`}
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

      {/* Grid (2 colunas no desktop) */}
      <div className="grid md:grid-cols-2 gap-3">
        {/* Instituição */}
        <div>
          <label htmlFor={`edu-inst-${item.id}`} className="label">
            Instituição *
          </label>
          <input
            id={`edu-inst-${item.id}`}
            className={`input ${errors.instituicao ? 'ring-2 ring-red-500 border-red-500' : ''}`}
            value={item.instituicao}
            onChange={(e) => set({ instituicao: e.target.value })}
            placeholder="Ex.: Universidade Federal..."
          />
          {errors.instituicao && (
            <p className="help text-red-600">{errors.instituicao}</p>
          )}
        </div>

        {/* Curso */}
        <div>
          <label htmlFor={`edu-curso-${item.id}`} className="label">
            Curso *
          </label>
          <input
            id={`edu-curso-${item.id}`}
            className={`input ${errors.curso ? 'ring-2 ring-red-500 border-red-500' : ''}`}
            value={item.curso}
            onChange={(e) => set({ curso: e.target.value })}
            placeholder="Ex.: Bacharelado em Sistemas de Informação"
          />
          {errors.curso && <p className="help text-red-600">{errors.curso}</p>}
        </div>

        {/* Período */}
        <div className="md:col-span-2">
          <label className="label">Período *</label>
          <PeriodPicker
            value={item.periodo}
            onChange={(v) => set({ periodo: v })}
            allowOpenEnded
            error={errors.periodo}
          />
          {/* Não duplicar erro aqui: o PeriodPicker já exibe */}
        </div>
      </div>
    </div>
  );
}
