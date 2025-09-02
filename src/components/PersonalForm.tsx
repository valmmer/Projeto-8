import { type ChangeEvent, useState } from 'react';
import { useResume } from '../state/ResumeContext';
import type { PersonalErrors } from '../state/personal';
import ImproveButton from '../components/ImproveButton'; // ✅ botão IA

const MAX_MB = 3;
const ACCEPT = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

const FontFaceSe: React.CSSProperties = {
  color: 'red',
  fontFamily: 'Arial, sans-serif',
  fontSize: '14px',
  fontWeight: 'bold',
};

// ✅ corte suave para respeitar 600 chars sem quebrar palavra
function softClamp(text: string, maxLen: number) {
  if (text.length <= maxLen) return text;
  const sliced = text.slice(0, maxLen + 1);
  const lastSpace = sliced.lastIndexOf(' ');
  return (
    (lastSpace > 0
      ? sliced.slice(0, lastSpace)
      : sliced.slice(0, maxLen)
    ).trim() + '…'
  );
}

// ✅ duração do highlight pós-IA
const FX_MS = 900;

export default function PersonalForm({
  submitted = false,
  errors = {},
}: {
  submitted?: boolean;
  errors?: PersonalErrors;
}) {
  const { state, dispatch } = useResume();
  const [fotoErro, setFotoErro] = useState<string>('');
  const resumo = state.dados.resumo ?? '';
  const max = 600;

  // ✅ estados do efeito no RESUMO
  const [resumoLoading, setResumoLoading] = useState(false); // overlay enquanto melhora
  const [resumoFx, setResumoFx] = useState(false); // highlight após retorno

  // ✅ aplica retorno da IA + highlight suave
  function applyResumoFromAI(textoMelhorado: string) {
    const clamped = softClamp(textoMelhorado, max);
    dispatch({ type: 'SET_DADOS', payload: { resumo: clamped } });
    setResumoFx(true);
    window.setTimeout(() => setResumoFx(false), FX_MS);
  }

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
    const url = URL.createObjectURL(file);
    dispatch({ type: 'SET_DADOS', payload: { foto: url } });
  }

  function removerFoto() {
    dispatch({ type: 'SET_DADOS', payload: { foto: '' } });
    setFotoErro('');
  }

  const withErr = (hasErr?: boolean) =>
    `input ${hasErr ? 'ring-2 ring-red-500 border-red-500' : ''}`;
  const show = (k: keyof typeof errors) => submitted && errors[k];

  return (
    <section className="section">
      <h2 className="text-xl font-semibold">
        {' '}
        Dados Pessoais <strong style={FontFaceSe}>* Campos Obrigatórios</strong>
      </h2>

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
                <label className="label">Nome completo *</label>
                <input
                  className={withErr(!!show('nome'))}
                  aria-invalid={!!show('nome')}
                  value={state.dados.nome}
                  onChange={(e) =>
                    dispatch({
                      type: 'SET_DADOS',
                      payload: { nome: e.target.value },
                    })
                  }
                />
                {show('nome') && (
                  <p className="help text-red-600">{errors.nome}</p>
                )}
              </div>

              <div className="field">
                <label className="label">Cidade / País</label>
                <input
                  className={withErr(!!show('cidadePais'))}
                  aria-invalid={!!show('cidadePais')}
                  value={state.dados.cidadePais ?? ''}
                  onChange={(e) =>
                    dispatch({
                      type: 'SET_DADOS',
                      payload: { cidadePais: e.target.value },
                    })
                  }
                />
                {show('cidadePais') && (
                  <p className="help text-red-600">{errors.cidadePais}</p>
                )}
              </div>

              <div className="field">
                <label className="label">Data de nascimento *</label>
                <input
                  type="date"
                  className={withErr(!!show('dataNascimento'))}
                  aria-invalid={!!show('dataNascimento')}
                  value={state.dados.dataNascimento ?? ''}
                  onChange={(e) =>
                    dispatch({
                      type: 'SET_DADOS',
                      payload: { dataNascimento: e.target.value },
                    })
                  }
                />
                {show('dataNascimento') && (
                  <p className="help text-red-600">{errors.dataNascimento}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contatos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
            <div className="field">
              <label className="label">Email *</label>
              <input
                className={withErr(!!show('email'))}
                aria-invalid={!!show('email')}
                type="email"
                value={state.dados.email}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_DADOS',
                    payload: { email: e.target.value },
                  })
                }
              />
              {show('email') && (
                <p className="help text-red-600">{errors.email}</p>
              )}
            </div>
            <div className="field">
              <label className="label">Telefone (DDD/DDI) *</label>
              <input
                className={withErr(!!show('telefone'))}
                aria-invalid={!!show('telefone')}
                value={state.dados.telefone}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_DADOS',
                    payload: { telefone: e.target.value },
                  })
                }
              />
              {show('telefone') && (
                <p className="help text-red-600">{errors.telefone}</p>
              )}
            </div>
            <div className="field">
              <label className="label">LinkedIn</label>
              <input
                className={withErr(!!show('linkedin'))}
                aria-invalid={!!show('linkedin')}
                placeholder="https://linkedin.com/in/..."
                value={state.dados.linkedin}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_DADOS',
                    payload: { linkedin: e.target.value },
                  })
                }
              />
              {show('linkedin') && (
                <p className="help text-red-600">{errors.linkedin}</p>
              )}
            </div>
            <div className="field">
              <label className="label">GitHub </label>
              <input
                className={withErr(!!show('github'))}
                aria-invalid={!!show('github')}
                value={state.dados.github ?? ''}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_DADOS',
                    payload: { github: e.target.value },
                  })
                }
              />
              {show('github') && (
                <p className="help text-red-600">{errors.github}</p>
              )}
            </div>
            <div className="field md:col-span-2">
              <label className="label">Portfólio / Site</label>
              <input
                className={withErr(!!show('site'))}
                aria-invalid={!!show('site')}
                value={state.dados.site ?? ''}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_DADOS',
                    payload: { site: e.target.value },
                  })
                }
              />
              {show('site') && (
                <p className="help text-red-600">{errors.site}</p>
              )}
            </div>
          </div>

          {/* =========================
             Resumo: IA + overlay durante loading + highlight pós-IA
             ========================= */}
          <div
            className="field mt-5"
            aria-busy={resumoLoading ? 'true' : 'false'}
          >
            <label className="label">Resumo profissional *</label>

            <div className="flex items-center justify-between gap-3 mb-2">
              <div
                className={`text-xs transition-transform duration-300 ${
                  resumoFx ? 'scale-105' : ''
                } ${resumo.length <= max ? 'text-slate-500' : 'text-red-600'}`}
              >
                {resumo.length}/{max}
              </div>

              {/* ✅ Passa onLoadingChange para controlar overlay */}
              <ImproveButton
                value={resumo}
                field="resumo"
                onChange={applyResumoFromAI}
                onLoadingChange={setResumoLoading}
              />
            </div>

            {/* ✅ Wrapper relativo para suportar overlay absoluto */}
            <div className="relative">
              {/* Textarea com highlight pós-IA */}
              <textarea
                className={`${withErr(!!show('resumo'))} h-28 w-full transition-colors duration-700 ${
                  resumoFx ? 'bg-amber-50 ring-1 ring-amber-300' : ''
                } ${resumoLoading ? 'opacity-90' : ''}`}
                aria-invalid={!!show('resumo')}
                placeholder="Máx. 600 caracteres"
                value={resumo}
                readOnly={resumoLoading} // ✅ impede digitação durante processamento
                onChange={(e) =>
                  dispatch({
                    type: 'SET_DADOS',
                    payload: { resumo: e.target.value },
                  })
                }
              />

              {/* ✅ OVERLAY durante melhoria: blur + pulse + spinner */}
              {resumoLoading && (
                <div className="absolute inset-0 z-10 grid place-items-center rounded-xl bg-white/60 dark:bg-slate-900/50 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 animate-pulse">
                    {/* spinner SVG simples */}
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z"
                      />
                    </svg>
                    <span>Melhorando seu texto…</span>
                  </div>

                  {/* barra fininha no topo (indeterminada) */}
                  <div className="pointer-events-none absolute left-0 right-0 top-0 h-0.5 overflow-hidden">
                    <div className="h-full w-1/3 animate-pulse bg-amber-400/80 rounded-r-full"></div>
                  </div>
                </div>
              )}
            </div>

            {show('resumo') && (
              <p className="help text-red-600">{errors.resumo}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
