import { useState } from 'react';
import { useResume, rid } from '../state/ResumeContext';
import type { Certification } from '../types';

export default function CertificationsForm() {
  const { state, dispatch } = useResume();
  const [c, setC] = useState<Certification>({
    id: '',
    titulo: '',
    orgao: '',
    ano: '',
  });

  const add = () => {
    if (!c.titulo.trim()) return;
    dispatch({ type: 'ADD_CERT', payload: { ...c, id: rid() } });
    setC({ id: '', titulo: '', orgao: '', ano: '' });
  };

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Certificações</h2>
      <div className="grid grid-cols-3 gap-3">
        <input
          className="input col-span-2"
          placeholder="Título (ex.: AWS SAA)"
          value={c.titulo}
          onChange={(e) => setC({ ...c, titulo: e.target.value })}
        />
        <input
          className="input"
          placeholder="Órgão (ex.: AWS, Cisco)"
          value={c.orgao}
          onChange={(e) => setC({ ...c, orgao: e.target.value })}
        />
        <input
          className="input"
          placeholder="Ano (opcional)"
          value={c.ano ?? ''}
          onChange={(e) => setC({ ...c, ano: e.target.value })}
        />
        <div className="col-span-3">
          <button
            onClick={add}
            className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-700 text-white"
          >
            Adicionar certificação
          </button>
        </div>
      </div>

      <ul className="space-y-3">
        {state.certificacoes.length === 0 ? (
          <li className="p-3 text-slate-500 bg-white rounded-xl border">
            Nenhuma certificação adicionada.
          </li>
        ) : (
          state.certificacoes.map((x) => (
            <li
              key={x.id}
              className="p-3 bg-white rounded-xl border flex items-center justify-between"
            >
              <span>
                {x.titulo}
                {x.orgao ? ` — ${x.orgao}` : ''}
                {x.ano ? ` (${x.ano})` : ''}
              </span>
              <button
                onClick={() => dispatch({ type: 'REMOVE_CERT', payload: x.id })}
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
