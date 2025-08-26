import { useState } from 'react';
import { useResume, rid } from '../state/ResumeContext';
import type { Education } from '../types';

export default function EducationForm() {
  const { state, dispatch } = useResume();
  const [form, setForm] = useState<Education>({
    id: '',
    curso: '',
    instituicao: '',
    periodo: '',
  });

  const add = () => {
    if (!form.curso.trim() || !form.instituicao.trim()) return;
    dispatch({ type: 'ADD_EDU', payload: { ...form, id: rid() } });
    setForm({ id: '', curso: '', instituicao: '', periodo: '' });
  };

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Formação Acadêmica</h2>
      <div className="grid grid-cols-2 gap-3">
        <input
          className="input"
          placeholder="Curso"
          value={form.curso}
          onChange={(e) => setForm({ ...form, curso: e.target.value })}
        />
        <input
          className="input"
          placeholder="Instituição"
          value={form.instituicao}
          onChange={(e) => setForm({ ...form, instituicao: e.target.value })}
        />
        <input
          className="input col-span-2"
          placeholder="Período (ex.: 2016 — 2017)"
          value={form.periodo}
          onChange={(e) => setForm({ ...form, periodo: e.target.value })}
        />
        <div className="col-span-2">
          <button
            onClick={add}
            className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-700 text-white"
          >
            Adicionar formação
          </button>
        </div>
      </div>

      <ul className="space-y-3">
        {state.formacoes.length === 0 ? (
          <li className="p-3 text-slate-500 bg-white rounded-xl border">
            Nenhuma formação adicionada.
          </li>
        ) : (
          state.formacoes.map((f) => (
            <li
              key={f.id}
              className="p-3 bg-white rounded-xl border flex items-start justify-between gap-3"
            >
              <div>
                <div className="font-medium">{f.curso}</div>
                <div className="text-sm text-slate-600">
                  {f.instituicao}
                  {f.periodo ? ` — ${f.periodo}` : ''}
                </div>
              </div>
              <button
                onClick={() => dispatch({ type: 'REMOVE_EDU', payload: f.id })}
                className="text-sm px-3 py-1 rounded-lg border border-red-600 text-red-700 hover:bg-red-50"
              >
                Remover
              </button>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
