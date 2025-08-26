import { useState } from 'react';
import { useResume, rid } from '../state/ResumeContext';
import type { Experience } from '../types';

export default function ExperienceForm() {
  const { state, dispatch } = useResume();
  const [form, setForm] = useState<Experience>({
    id: '',
    empresa: '',
    cargo: '',
    periodo: '',
    atual: false,
    descricao: '',
  });

  function add() {
    if (!form.empresa.trim() || !form.cargo.trim()) return;
    dispatch({ type: 'ADD_EXP', payload: { ...form, id: rid() } });
    setForm({
      id: '',
      empresa: '',
      cargo: '',
      periodo: '',
      atual: false,
      descricao: '',
    });
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Experiências</h2>

      <div className="grid grid-cols-2 gap-3">
        <input
          className="input"
          placeholder="Empresa"
          value={form.empresa}
          onChange={(e) => setForm({ ...form, empresa: e.target.value })}
        />
        <input
          className="input"
          placeholder="Cargo"
          value={form.cargo}
          onChange={(e) => setForm({ ...form, cargo: e.target.value })}
        />
        <input
          className="input col-span-2"
          placeholder="Período (ex.: Jan/2023 — Dez/2024)"
          value={form.periodo}
          onChange={(e) => setForm({ ...form, periodo: e.target.value })}
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.atual}
            onChange={(e) => setForm({ ...form, atual: e.target.checked })}
          />
          Trabalho atual
        </label>
        <div className="col-span-2">
          <textarea
            className="input h-24"
            placeholder="Descrição das atividades, resultados, tecnologias…"
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          />
        </div>
        <div className="col-span-2">
          <button
            onClick={add}
            className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-700 text-white"
          >
            Adicionar experiência
          </button>
        </div>
      </div>

      <ul className="space-y-3">
        {state.experiencias.length === 0 ? (
          <li className="p-3 text-slate-500 bg-white rounded-xl border">
            Nenhuma experiência adicionada.
          </li>
        ) : (
          state.experiencias.map((e) => (
            <li key={e.id} className="p-3 bg-white rounded-xl border">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">
                    {e.cargo} · {e.empresa}
                  </div>
                  <div className="text-xs text-slate-600">
                    {e.periodo}
                    {e.atual ? ' (atual)' : ''}
                  </div>
                </div>
                <button
                  onClick={() =>
                    dispatch({ type: 'REMOVE_EXP', payload: e.id })
                  }
                  className="text-sm px-3 py-1 rounded-lg border border-red-600 text-red-700 hover:bg-red-50"
                >
                  Remover
                </button>
              </div>
              <p className="text-sm mt-2">{e.descricao}</p>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
