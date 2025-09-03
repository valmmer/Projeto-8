import { useMemo, useState } from 'react';
import { useResume } from '../state/ResumeContext';
import ImproveButton from '../components/ImproveButton';
import type { Skill } from '../types';
import { validatePersonal } from '../state/personal'; // ✅ validação reutilizada

const MAX_OBJ = 160;

/** Corta texto no limite sem quebrar a última palavra e adiciona “…” */
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

/** Monta o prompt com contexto para a IA gerar/melhorar o objetivo */
function composeObjectivePrompt(opts: {
  objetivo: string;
  cidadePais?: string | null;
  lastRole?: string | null;
  lastCompany?: string | null;
  topSkills?: string[];
}) {
  const { objetivo, cidadePais, lastRole, lastCompany, topSkills = [] } = opts;
  const lines: string[] = [];
  if (objetivo?.trim())
    lines.push(`Objetivo atual (rascunho): "${objetivo.trim()}"`);
  if (lastRole)
    lines.push(
      `Último cargo: ${lastRole}${lastCompany ? ` · ${lastCompany}` : ''}`,
    );
  if (cidadePais) lines.push(`Local: ${cidadePais}`);
  if (topSkills.length)
    lines.push(`Habilidades-chave: ${topSkills.join(', ')}`);
  lines.push(
    `Tarefa: Escreva/reescreva um OBJETIVO PROFISSIONAL em 1 frase (máx. ${MAX_OBJ} caracteres), ` +
      `focado na função desejada, área/segmento e no valor que posso gerar. ` +
      `Tom profissional e direto; evite primeira pessoa e emojis; não use prefixos como "Objetivo:". ` +
      `Responda apenas com a frase final.`,
  );
  return lines.join('\n');
}

export default function ObjectiveForm() {
  const { state, dispatch } = useResume();

  // Estados de UX
  const [loading, setLoading] = useState(false); // overlay durante a chamada de IA
  const [fx, setFx] = useState(false); // highlight suave após aplicar IA

  // Dados do estado global
  const objetivo = state.dados.objetivo ?? '';
  const cidadePais = state.dados.cidadePais ?? '';

  // Última experiência para contexto do prompt (cargo/empresa)
  const lastExp = useMemo(() => {
    const arr = state.experiencias ?? [];
    if (!arr.length) return null;
    return arr[arr.length - 1];
  }, [state.experiencias]);

  const lastRole = lastExp?.cargo ?? null;
  const lastCompany = lastExp?.empresa ?? null;

  // Normaliza Skills (Skill[] ou string[]) -> string[] "Nome (Nível)"
  const topSkills = useMemo<string[]>(() => {
    const list = (state.skills ?? []) as Array<Skill | string>;
    const names = list
      .map((it) =>
        typeof it === 'string'
          ? it
          : it?.nome
            ? `${it.nome}${it.nivel ? ` (${it.nivel})` : ''}`
            : '',
      )
      .filter(Boolean);
    return names.slice(0, 5);
  }, [state.skills]);

  // Prompt para o botão de IA
  const prompt = useMemo(
    () =>
      composeObjectivePrompt({
        objetivo,
        cidadePais,
        lastRole,
        lastCompany,
        topSkills,
      }),
    [objetivo, cidadePais, lastRole, lastCompany, topSkills],
  );

  // ✅ Validação em tempo real do Objetivo e Cidade/País
  // - requireObjetivo: true (este passo exige objetivo)
  // - requireResumo: false (resumo já foi no passo anterior)
  const pErrors = useMemo(
    () =>
      validatePersonal(
        { ...state.dados, objetivo: objetivo, cidadePais }, // garante leitura local
        { requireResumo: false, requireObjetivo: true, maxObjetivo: MAX_OBJ },
      ),
    [
      objetivo,
      cidadePais,
      state.dados.email,
      state.dados.nome,
      state.dados.telefone,
    ],
  );
  const objetivoHasErr = !!pErrors.objetivo;
  const cidadeHasErr = !!pErrors.cidadePais;

  /** Aplica o retorno da IA no campo com clamp e highlight */
  function applyFromAI(text: string) {
    const clamped = softClamp(text, MAX_OBJ);
    dispatch({ type: 'SET_DADOS', payload: { objetivo: clamped } });
    setFx(true);
    window.setTimeout(() => setFx(false), 900);
  }

  /** onChange com clamp suave (garante que não estoure o limite) */
  function handleChangeObjetivo(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    const value = raw.length > MAX_OBJ ? softClamp(raw, MAX_OBJ) : raw;
    dispatch({ type: 'SET_DADOS', payload: { objetivo: value } });
  }

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">Objetivo Profissional</h2>

      <div className="grid grid-cols-2 gap-3">
        {/* Campo Objetivo + Botão IA */}
        <div className="col-span-2">
          <div className="flex items-center justify-between gap-3 mb-2">
            <label className="label m-0">Objetivo</label>

            {/* Contador de caracteres com cor dinâmica */}
            <span
              className={`text-xs transition-transform duration-300 ${
                fx ? 'scale-105' : ''
              } ${objetivo.length <= MAX_OBJ ? 'text-slate-500' : 'text-red-600'}`}
            >
              {objetivo.length}/{MAX_OBJ}
            </span>

            {/* Botão ✨ IA */}
            <ImproveButton
              value={prompt}
              field="objetivo"
              onChange={applyFromAI}
              onLoadingChange={setLoading}
            />
          </div>

          {/* Wrapper relativo para overlay de loading */}
          <div className="relative">
            <input
              className={`input col-span-2 w-full transition-colors duration-700 ${
                fx ? 'bg-amber-50 ring-1 ring-amber-300' : ''
              } ${loading ? 'opacity-90' : ''} ${
                objetivoHasErr ? 'ring-2 ring-red-500 border-red-500' : ''
              }`}
              placeholder="Ex.: Gestor de Infraestrutura de TI com foco em cloud e segurança"
              value={objetivo}
              readOnly={loading} // evita edição durante geração
              aria-invalid={objetivoHasErr}
              onChange={handleChangeObjetivo}
            />

            {/* Mensagem de erro do Objetivo */}
            {pErrors.objetivo && (
              <p className="help text-red-600 mt-1">{pErrors.objetivo}</p>
            )}

            {/* Overlay/Loading enquanto chama a IA */}
            {loading && (
              <div className="absolute inset-0 z-10 grid place-items-center rounded-xl bg-white/60 dark:bg-slate-900/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 animate-pulse">
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
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
                  <span>Gerando objetivo…</span>
                </div>
                <div className="pointer-events-none absolute left-0 right-0 top-0 h-0.5 overflow-hidden">
                  <div className="h-full w-1/3 animate-pulse bg-amber-400/80 rounded-r-full"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Campo Cidade/País (opcional) com erro de tamanho se houver */}
        <div className="col-span-2 sm:col-span-1">
          <input
            className={`input ${cidadeHasErr ? 'ring-2 ring-red-500 border-red-500' : ''}`}
            placeholder="Cidade / País (opcional)"
            value={cidadePais}
            aria-invalid={cidadeHasErr}
            onChange={(e) =>
              dispatch({
                type: 'SET_DADOS',
                payload: { cidadePais: e.target.value },
              })
            }
          />
          {pErrors.cidadePais && (
            <p className="help text-red-600 mt-1">{pErrors.cidadePais}</p>
          )}
        </div>
      </div>
    </section>
  );
}
