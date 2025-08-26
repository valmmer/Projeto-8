import { useState } from 'react';
import { useResume, rid } from '../state/ResumeContext';
import type { SkillLevel } from '../types';

export default function SkillsForm() {
  const { state, dispatch } = useResume();
  const [nome, setNome] = useState('');
  const [nivel, setNivel] = useState<SkillLevel>('Básico');

  function add() {
    if (!nome.trim()) return;
    dispatch({
      type: 'ADD_SKILL',
      payload: { id: rid(), nome: nome.trim(), nivel },
    });
    setNome('');
    setNivel('Básico');
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Habilidades</h2>

      <div className="grid grid-cols-3 gap-3">
        <input
          className="input col-span-2"
          placeholder="Ex.: React, SQL, Docker"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <select
          className="input"
          value={nivel}
          onChange={(e) => setNivel(e.target.value as SkillLevel)}
        >
          <option>Básico</option>
          <option>Intermediário</option>
          <option>Avançado</option>
        </select>
        <div className="col-span-3">
          <button
            onClick={add}
            className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-700 text-white"
          >
            Adicionar habilidade
          </button>
        </div>
      </div>

      <ul className="divide-y rounded-xl border bg-white">
        {state.skills.length === 0 ? (
          <li className="p-3 text-slate-500">Nenhuma habilidade adicionada.</li>
        ) : (
          state.skills.map((s) => (
            <li key={s.id} className="flex items-center justify-between p-3">
              <span>
                {s.nome} — <span className="text-slate-600">{s.nivel}</span>
              </span>
              <button
                onClick={() =>
                  dispatch({ type: 'REMOVE_SKILL', payload: s.id })
                }
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
