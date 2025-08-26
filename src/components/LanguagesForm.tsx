import { useState } from 'react';
import { useResume, rid } from '../state/ResumeContext';
import type { Language } from '../types';

export default function LanguagesForm() {
  const { state, dispatch } = useResume();
  const [l, setL] = useState<Language>({
    id: '',
    idioma: '',
    nivel: 'Intermediário',
  });

  const add = () => {
    if (!l.idioma.trim()) return;
    dispatch({ type: 'ADD_LANG', payload: { ...l, id: rid() } });
    setL({ id: '', idioma: '', nivel: 'Intermediário' });
  };

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Idiomas</h2>
      <div className="grid grid-cols-3 gap-3">
        <input
          className="input col-span-2"
          placeholder="Idioma (ex.: Inglês)"
          value={l.idioma}
          onChange={(e) => setL({ ...l, idioma: e.target.value })}
        />
        <select
          className="input"
          value={l.nivel}
          onChange={(e) =>
            setL({ ...l, nivel: e.target.value as Language['nivel'] })
          }
        >
          <option>Básico</option>
          <option>Intermediário</option>
          <option>Avançado</option>
          <option>Fluente</option>
          <option>Nativo</option>
        </select>
        <div className="col-span-3">
          <button
            onClick={add}
            className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-700 text-white"
          >
            Adicionar idioma
          </button>
        </div>
      </div>

      <ul className="space-y-3">
        {state.idiomas.length === 0 ? (
          <li className="p-3 text-slate-500 bg-white rounded-xl border">
            Nenhum idioma adicionado.
          </li>
        ) : (
          state.idiomas.map((x) => (
            <li
              key={x.id}
              className="p-3 bg-white rounded-xl border flex items-center justify-between"
            >
              <span>
                {x.idioma} — {x.nivel}
              </span>
              <button
                onClick={() => dispatch({ type: 'REMOVE_LANG', payload: x.id })}
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
