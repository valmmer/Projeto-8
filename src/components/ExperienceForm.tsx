import { useState } from 'react';
import { useResume, rid } from '../state/ResumeContext';
import type { Experience } from '../types';

// ✅ Botão reutilizado que chama /api/ai/improve (já criado antes)
import ImproveButton from '../components/ImproveButton';

// ✅ limite de tamanho (mantive 600 para ficar consistente com o Resumo)
const MAX_DESC = 600;

// ✅ util: corte suave para não quebrar a última palavra
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

// ✅ monta um prompt com contexto da experiência (gera mesmo se descrição estiver vazia)
function composeExperiencePrompt(f: Experience) {
  const linhas: string[] = [];
  if (f.cargo) linhas.push(`Cargo: ${f.cargo}`);
  if (f.empresa) linhas.push(`Empresa: ${f.empresa}`);
  if (f.periodo)
    linhas.push(`Período: ${f.periodo}${f.atual ? ' (atual)' : ''}`);
  if (f.descricao?.trim()) linhas.push(`Base/rascunho: ${f.descricao.trim()}`);

  // instruções para a IA: bullets/frasas, verbos de ação, métricas, techs, tom objetivo
  linhas.push(
    `Tarefa: Escreva uma descrição de experiência profissional forte em português brasileiro, ` +
      `com 2–4 frases ou 3–5 bullets, usando verbos de ação no início, quantificando resultados ` +
      `(% / R$ / tempo / volume) quando possível e citando tecnologias/metodologias relevantes. ` +
      `Tom objetivo, claro, sem primeira pessoa. Evite repetir cargo/empresa. ` +
      `Responda apenas com o texto final (sem títulos, sem markdown).`,
  );

  return linhas.join('\n');
}

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

  // ✅ estados de UX só para a DESCRIÇÃO (loading + highlight pós-IA)
  const [descLoading, setDescLoading] = useState(false);
  const [descFx, setDescFx] = useState(false);

  // ✅ aplica retorno da IA na descrição + highlight suave
  function applyDescricaoFromAI(texto: string) {
    const clamped = softClamp(texto, MAX_DESC);
    setForm((old) => ({ ...old, descricao: clamped }));
    setDescFx(true);
    window.setTimeout(() => setDescFx(false), 900); // mesmo padrão do resumo
  }

  // ✅ prompt que vamos enviar ao botão de IA (mesmo se descrição vazia)
  const expPrompt = composeExperiencePrompt(form);

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

        {/* =========================
            Descrição + IA integrada
           ========================= */}
        <div className="col-span-2">
          <div className="flex items-center justify-between gap-3 mb-2">
            <label className="label m-0">Descrição</label>

            {/* contador simples */}
            <span
              className={`text-xs transition-transform duration-300 ${
                descFx ? 'scale-105' : ''
              } ${form.descricao.length <= MAX_DESC ? 'text-slate-500' : 'text-red-600'}`}
            >
              {form.descricao.length}/{MAX_DESC}
            </span>

            {/* ✅ Botão IA:
                - envia expPrompt (com contexto) mesmo que a descrição esteja vazia
                - field="experiencia"
                - controla overlay via onLoadingChange */}
            <ImproveButton
              value={expPrompt}
              field="experiencia"
              onChange={applyDescricaoFromAI}
              onLoadingChange={setDescLoading}
            />
          </div>

          {/* Wrapper relativo para overlay */}
          <div className="relative">
            <textarea
              className={`input h-24 w-full transition-colors duration-700 ${
                descFx ? 'bg-amber-50 ring-1 ring-amber-300' : ''
              } ${descLoading ? 'opacity-90' : ''}`}
              placeholder="Descrição das atividades, resultados, tecnologias…"
              value={form.descricao}
              readOnly={descLoading} // evita digitação enquanto a IA processa
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            />

            {/* ✅ OVERLAY durante a melhoria da IA */}
            {descLoading && (
              <div className="absolute inset-0 z-10 grid place-items-center rounded-xl bg-white/60 dark:bg-slate-900/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 animate-pulse">
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
                  <span>Gerando descrição com IA…</span>
                </div>
                <div className="pointer-events-none absolute left-0 right-0 top-0 h-0.5 overflow-hidden">
                  <div className="h-full w-1/3 animate-pulse bg-amber-400/80 rounded-r-full"></div>
                </div>
              </div>
            )}
          </div>
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
              <p className="text-sm mt-2 whitespace-pre-line">{e.descricao}</p>
              {/* ↑ whitespace-pre-line permite bullets com quebras de linha vindas da IA */}
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
