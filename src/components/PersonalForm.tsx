import { type ChangeEvent, useState } from 'react';
import { useResume } from '../state/ResumeContext';

const MAX_MB = 3;
const ACCEPT = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export default function PersonalForm() {
  const { state, dispatch } = useResume();
  const [fotoErro, setFotoErro] = useState<string>('');
  const resumo = state.dados.resumo ?? '';
  const max = 600;

  function onFotoChange(e: ChangeEvent<HTMLInputElement>) {
    setFotoErro('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPT.includes(file.type)) {
      setFotoErro('Use PNG/JPG/WEBP.');
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setFotoErro(`Tamanho máximo: ${MAX_MB}MB.`);
      return;
    }
    const url = URL.createObjectURL(file); // preview imediato
    dispatch({ type: 'SET_DADOS', payload: { foto: url } });
  }

  function removerFoto() {
    dispatch({ type: 'SET_DADOS', payload: { foto: '' } });
    setFotoErro('');
  }

  return (
    <section className="section">
      <h2 className="text-xl font-semibold">Dados Pessoais</h2>

      <div className="card">
        <div className="card-body">
          {/* Linha: Avatar + dados principais */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Coluna avatar */}
            <div className="md:col-span-3">
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-200 ring-2 ring-slate-300 shrink-0">
                  {state.dados.foto ? (
                    <img
                      src={state.dados.foto}
                      alt={state.dados.nome || 'Foto'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-slate-500 text-xs">
                      Sem foto
                    </div>
                  )}
                </div>

                {/* Botões */}
                <div className="flex items-center gap-2">
                  <input
                    id="foto-input"
                    type="file"
                    accept={ACCEPT.join(',')}
                    onChange={onFotoChange}
                    className="sr-only"
                  />
                  <label
                    htmlFor="foto-input"
                    className="btn btn-outline cursor-pointer"
                  >
                    Selecionar foto
                  </label>
                  {state.dados.foto && (
                    <button
                      type="button"
                      onClick={removerFoto}
                      className="btn btn-outline"
                    >
                      Remover
                    </button>
                  )}
                </div>
                <p className="help -mt-1">PNG/JPG/WEBP · até {MAX_MB}MB</p>
                {fotoErro && <p className="help text-red-600">{fotoErro}</p>}
              </div>
            </div>

            {/* Coluna campos principais */}
            <div className="md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="field md:col-span-2">
                <label className="label">Nome completo (Obrigatório)</label>
                <input
                  className="input"
                  value={state.dados.nome}
                  onChange={(e) =>
                    dispatch({
                      type: 'SET_DADOS',
                      payload: { nome: e.target.value },
                    })
                  }
                />
              </div>

              <div className="field">
                <label className="label">Cidade/País</label>
                <input
                  className="input"
                  value={state.dados.cidadePais ?? ''}
                  onChange={(e) =>
                    dispatch({
                      type: 'SET_DADOS',
                      payload: { cidadePais: e.target.value },
                    })
                  }
                />
              </div>

              <div className="field">
                <label className="label">Data de nascimento</label>
                <input
                  type="date"
                  className="input"
                  value={state.dados.dataNascimento ?? ''}
                  onChange={(e) =>
                    dispatch({
                      type: 'SET_DADOS',
                      payload: { dataNascimento: e.target.value },
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Contatos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
            <div className="field">
              <label className="label">Email (Obrigatório)</label>
              <input
                className="input"
                type="email"
                value={state.dados.email}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_DADOS',
                    payload: { email: e.target.value },
                  })
                }
              />
            </div>
            <div className="field">
              <label className="label">Telefone (DDD/DDI) (Obrigatório)</label>
              <input
                className="input"
                value={state.dados.telefone}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_DADOS',
                    payload: { telefone: e.target.value },
                  })
                }
              />
            </div>
            <div className="field">
              <label className="label">LinkedIn (Obrigatório)</label>
              <input
                className="input"
                placeholder="https://linkedin.com/in/..."
                value={state.dados.linkedin}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_DADOS',
                    payload: { linkedin: e.target.value },
                  })
                }
              />
            </div>
            <div className="field">
              <label className="label">GitHub</label>
              <input
                className="input"
                value={state.dados.github ?? ''}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_DADOS',
                    payload: { github: e.target.value },
                  })
                }
              />
            </div>
            <div className="field md:col-span-2">
              <label className="label">Portfólio / Site</label>
              <input
                className="input"
                value={state.dados.site ?? ''}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_DADOS',
                    payload: { site: e.target.value },
                  })
                }
              />
            </div>
          </div>

          {/* Resumo */}
          <div className="field mt-5">
            <label className="label">Resumo profissional (Obrigatório)</label>
            <textarea
              className="input h-28"
              placeholder="Máx. 600 caracteres"
              value={resumo}
              onChange={(e) =>
                dispatch({
                  type: 'SET_DADOS',
                  payload: { resumo: e.target.value },
                })
              }
            />
            <div
              className={`text-xs text-right ${
                resumo.length <= max ? 'text-slate-500' : 'text-red-600'
              }`}
            >
              {resumo.length}/{max}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
