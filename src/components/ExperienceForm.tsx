// src/components/ExperienceForm.tsx
// -----------------------------------------------------------
// Experiências com:
// - Campos Empresa/Cargo
// - PeriodPicker (MM/AAAA - MM/AAAA | MM/AAAA - Atual)
// - Descrição com botão ✨ IA (improveText)
// - Overlay de loading, highlight suave e contador
// -----------------------------------------------------------

import { useMemo, useState } from 'react';
import { useResume, rid } from '../state/ResumeContext';
import type { Experience } from '../types';
import ImproveButton from './ImproveButton';
import AIOverlay from './ui/AIOverlay';
import PeriodPicker from './education/PeriodPicker'; // ✅ ajuste o caminho se seu arquivo estiver em outro local

const MAX_DESC = 600;

/** Corta sem quebrar a última palavra + reticências (para texto vindo da IA) */
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

/** Prompt “rico” p/ IA gerar/melhorar a descrição da experiência */
function composeExperiencePrompt(f: Experience) {
  const lines: string[] = [];
  if (f.cargo) lines.push(`Cargo: ${f.cargo}`);
  if (f.empresa) lines.push(`Empresa: ${f.empresa}`);
  if (f.periodo)
    lines.push(`Período: ${f.periodo}${f.atual ? ' (atual)' : ''}`);
  if (f.descricao?.trim()) lines.push(`Base/rascunho: ${f.descricao.trim()}`);
  lines.push(
    'Tarefa: Escreva uma descrição de experiência profissional forte em português brasileiro, ' +
      'com 2–4 frases ou 3–5 bullets; inicie com verbos de ação; quantifique resultados ' +
      '(% / R$ / tempo / volume) quando possível; cite tecnologias/metodologias relevantes. ' +
      'Tom objetivo, claro, sem primeira pessoa. Evite repetir cargo/empresa. ' +
      'Responda apenas com o texto final (sem títulos, sem markdown).',
  );
  return lines.join('\n');
}

export default function ExperienceForm() {
  const { state, dispatch } = useResume();

  // Estado do formulário local de inclusão
  const [form, setForm] = useState<Experience>({
    id: '',
    empresa: '',
    cargo: '',
    periodo: '', // ex.: "03/2018 - 12/2020" | "03/2018 - Atual"
    atual: false,
    descricao: '',
  });

  // UX da descrição
  const [descLoading, setDescLoading] = useState(false);
  const [descFx, setDescFx] = useState(false);

  // Aplica retorno da IA na descrição (respeita MAX_DESC)
  function applyDescricaoFromAI(texto: string) {
    const clamped = softClamp(texto, MAX_DESC);
    setForm((old) => ({ ...old, descricao: clamped }));
    setDescFx(true);
    window.setTimeout(() => setDescFx(false), 900);
  }

  // Prompt p/ o ImproveButton (mesmo com descrição vazia)
  const expPrompt = useMemo(() => composeExperiencePrompt(form), [form]);

  // Integração com o PeriodPicker:
  // - recebemos a string já formatada e deduzimos `atual` a partir do sufixo " - Atual"
  function handlePeriodoChange(periodo: string) {
    const isOpen = /-\s*Atual\s*$/i.test(periodo);
    setForm((old) => ({ ...old, periodo, atual: isOpen }));
  }

  // Regras simples para habilitar "Adicionar"
  const canAdd =
    form.empresa.trim() && form.cargo.trim() && form.periodo.trim();

  function add() {
    if (!canAdd) return;
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
    <section className="section">
      <div className="card avoid-break">
        <div className="card-body space-y-4">
          <h2 className="text-xl font-semibold">Experiência Profissional</h2>

          {/* Campos básicos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="field">
              <label className="label">Empresa *</label>
              <input
                className="input"
                value={form.empresa}
                onChange={(e) => setForm({ ...form, empresa: e.target.value })}
                placeholder="Ex.: ACME S.A."
              />
            </div>

            <div className="field">
              <label className="label">Cargo *</label>
              <input
                className="input"
                value={form.cargo}
                onChange={(e) => setForm({ ...form, cargo: e.target.value })}
                placeholder="Ex.: Analista de Sistemas"
              />
            </div>

            {/* Período (mês/ano com "Atual") */}
            <div className="field sm:col-span-2">
              <label className="label">Período *</label>
              <PeriodPicker
                value={form.periodo}
                onChange={handlePeriodoChange} // deduz "atual" no handler
                allowOpenEnded={true} // permite "MM/AAAA - Atual"
                // minYear={2000} maxYear={new Date().getFullYear()} // (opcional)
              />
            </div>
          </div>

          {/* Descrição + IA */}
          <div className="field">
            <div className="flex items-center justify-between gap-3 mb-2">
              <label className="label m-0">Descrição</label>

              <span
                className={`text-xs transition-transform duration-300 ${
                  descFx ? 'scale-105' : ''
                } ${form.descricao.length <= MAX_DESC ? 'text-slate-500' : 'text-red-600'}`}
              >
                {form.descricao.length}/{MAX_DESC}
              </span>

              <ImproveButton
                value={expPrompt}
                field="experiencia"
                onChange={applyDescricaoFromAI}
                onLoadingChange={setDescLoading}
              />
            </div>

            <div className="relative">
              <textarea
                className={`input h-28 w-full transition-colors duration-700 ${
                  descFx ? 'bg-amber-50 ring-1 ring-amber-300' : ''
                } ${descLoading ? 'opacity-90' : ''}`}
                placeholder="Principais responsabilidades, resultados, tecnologias…"
                value={form.descricao}
                readOnly={descLoading}
                onChange={(e) => {
                  const next = e.target.value;
                  // limite "hard" no digitar manual
                  setForm({
                    ...form,
                    descricao:
                      next.length > MAX_DESC ? next.slice(0, MAX_DESC) : next,
                  });
                }}
              />

              <AIOverlay
                show={descLoading}
                label="Gerando descrição…"
                tip="2–4 frases ou 3–5 bullets"
                blockInteraction={true}
              />
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-3">
            <button
              onClick={add}
              disabled={!canAdd}
              className="btn btn-primary disabled:opacity-60"
            >
              Adicionar experiência
            </button>
            {!canAdd && (
              <span className="text-xs text-slate-500">
                Preencha Empresa, Cargo e Período.
              </span>
            )}
          </div>

          {/* Lista das experiências adicionadas */}
          <ul className="space-y-3 mt-4">
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
                  {/* Mantém quebras vindas da IA */}
                  <p className="text-sm mt-2 whitespace-pre-line">
                    {e.descricao}
                  </p>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
