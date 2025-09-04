// src/components/ObjectiveForm.tsx
// ---------------------------------------------------------------------------
// Objetivo + Formação Acadêmica (quebrada em componentes).
// - IA melhora o rascunho SEM trocar de área/tema (respeita "desenvolvimento", etc).
// - 1 frase, ≤160 chars, sem "Objetivo:" e sem aspas.
// - A lista de formação foi movida para src/components/education/*
// ---------------------------------------------------------------------------

import React, { useMemo, useState } from 'react';
import { useResume } from '../state/ResumeContext';
import ImproveButton from './ImproveButton';
import AIOverlay from './ui/AIOverlay';
import EducationSection from './education/EducationSection';

import type { Skill } from '../types';
import { validatePersonal } from '../state/personal';

const MAX_OBJ = 160;

/** Corta no limite sem quebrar a última palavra e adiciona “…” */
function softClamp(text: string, maxLen: number) {
  if (text.length <= maxLen) return text;
  const s = text.slice(0, maxLen + 1);
  const last = s.lastIndexOf(' ');
  return (last > 0 ? s.slice(0, last) : s.slice(0, maxLen)).trim() + '…';
}

/** Remove clichês/rótulos comuns */
function stripCliches(t: string) {
  return t
    .replace(/^["“”']|["“”']$/g, '') // aspas nas pontas
    .replace(/^\s*(objetivo\s*:?\s*)/i, '') // "Objetivo:"
    .replace(/^\s*(busco|procuro|pretendo|desejo)\s+/i, '') // "busco/procuro..."
    .replace(/\s+/g, ' ')
    .trim();
}

/** Pega só a 1ª frase e normaliza */
function firstSentence(t: string) {
  const first = t.split(/[\.\?\!]\s|\n|\r/)[0] ?? t;
  return first.replace(/\s([,;:])/g, '$1').trim();
}

/** Detecta domínio básico a partir do rascunho */
function domainFromDraft(draft: string): 'dev' | 'sec' | 'other' {
  const s = draft.toLowerCase();
  if (
    /(desenvolv|dev|software|programa(ç|c)ão|frontend|back-?end|full\s*stack|mobile)/.test(
      s,
    )
  )
    return 'dev';
  if (
    /(seguran(ç|c)a|ciberseguran(ç|c)a|lgpd|compliance|governan(ç|c)a)/.test(s)
  )
    return 'sec';
  return 'other';
}

/** Mantém o domínio do rascunho (ex.: não trocar "dev" por "segurança") */
function enforceDomain(out: string, draft: string) {
  const dom = domainFromDraft(draft);
  if (dom === 'dev') {
    const mentionsDev =
      /(desenvolv|software|aplicativos?|sistemas?|apis?|front|back|full\s*stack|mobile)/i.test(
        out,
      );
    const mentionsSec = /(seguran(ç|c)a|lgpd|compliance|governan(ç|c)a)/i.test(
      out,
    );
    if (!mentionsDev && mentionsSec) {
      out = out
        .replace(
          /lgpd|compliance|governan(ç|c)a/gi,
          'boas práticas de desenvolvimento',
        )
        .replace(
          /seguran(ç|c)a( da informa(ç|c)(ão)?)?/gi,
          'desenvolvimento de software',
        );
    }
  }
  return out;
}

/** Preserva o tom "Busco ..." se o rascunho iniciar assim */
function keepDraftTone(out: string, draft: string) {
  if (/^\s*busco\b/i.test(draft)) {
    out = out.replace(/^\s*(Atuar|Pretendo|Desejo)\b/i, 'Busco atuar');
    if (!/^\s*Busco\b/.test(out)) {
      out = 'Busco ' + out.charAt(0).toLowerCase() + out.slice(1);
    }
  }
  return out;
}

/** Sanitiza a saída da IA: sem clichês/aspas, 1 frase, ≤160 e domínio/tom preservados */
function normalizeAIObjective(raw: string, draft: string, maxLen = MAX_OBJ) {
  let out = stripCliches(raw);
  out = firstSentence(out);
  out = out.replace(/[–—-]\s*$/g, '').replace(/\s*[.;,]$/g, '');
  out = enforceDomain(out, draft);
  out = keepDraftTone(out, draft);
  return softClamp(out, maxLen);
}

/** Prompt: melhorar rascunho, manter área/tema e (se aplicável) tom "Busco atuar" */
function composeObjectivePrompt(opts: {
  draft: string;
  lastRole?: string | null;
  lastCompany?: string | null;
  topSkills?: string[];
}) {
  const { draft, lastRole, lastCompany, topSkills = [] } = opts;
  const ctx: string[] = [];
  if (draft?.trim()) ctx.push(`Rascunho do candidato: "${draft.trim()}"`);
  if (lastRole)
    ctx.push(
      `Último cargo: ${lastRole}${lastCompany ? ` · ${lastCompany}` : ''}`,
    );
  if (topSkills.length)
    ctx.push(`Habilidades/ênfases: ${topSkills.join(', ')}`);

  const instr =
    `Tarefa: melhore o rascunho em **1 única frase** (máx. ${MAX_OBJ} caracteres), pt-BR, tom humano e direto. ` +
    `**Mantenha a mesma área/tema do rascunho.** Se o rascunho começar com "Busco", "Pretendo" ou "Desejo", ` +
    `mantenha um início equivalente (preferencialmente "Busco atuar"). ` +
    `Evite clichês e não use prefixos como "Objetivo:". Responda apenas com a frase final, sem aspas.`;

  return [...ctx, instr].join('\n');
}

export default function ObjectiveForm() {
  const { state, dispatch } = useResume();

  // ---------------- OBJETIVO ----------------
  const [loading, setLoading] = useState(false);
  const [fx, setFx] = useState(false);
  const [touched, setTouched] = useState(false);

  const objetivo = state.dados.objetivo ?? '';

  // Última experiência e top skills (contexto para IA)
  const lastExp = useMemo(() => {
    const arr = state.experiencias ?? [];
    return arr.length ? arr[arr.length - 1] : null;
  }, [state.experiencias]);

  const topSkills = useMemo<string[]>(() => {
    const list = state.skills ?? [];
    return list
      .map((it: any) =>
        typeof it === 'string'
          ? it
          : it?.nome
            ? `${it.nome}${it.nivel ? ` (${it.nivel})` : ''}`
            : '',
      )
      .filter(Boolean)
      .slice(0, 5);
  }, [state.skills]);

  const prompt = useMemo(
    () =>
      composeObjectivePrompt({
        draft: objetivo,
        lastRole: lastExp?.cargo ?? null,
        lastCompany: lastExp?.empresa ?? null,
        topSkills,
      }),
    [objetivo, lastExp?.cargo, lastExp?.empresa, topSkills],
  );

  // Objetivo é obrigatório neste passo
  const pErrors = useMemo(
    () =>
      validatePersonal(
        { ...state.dados, objetivo },
        { requireResumo: false, requireObjetivo: true, maxObjetivo: MAX_OBJ },
      ),
    [objetivo, state.dados],
  );
  const showObjErr = !!pErrors.objetivo && touched;

  function applyFromAI(text: string) {
    const normalized = normalizeAIObjective(text, objetivo, MAX_OBJ);
    dispatch({ type: 'SET_DADOS', payload: { objetivo: normalized } });
    setTouched(true);
    setFx(true);
    window.setTimeout(() => setFx(false), 900);
  }

  function handleChangeObjetivo(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    const value = raw.length > MAX_OBJ ? softClamp(raw, MAX_OBJ) : raw;
    if (!touched) setTouched(true);
    dispatch({ type: 'SET_DADOS', payload: { objetivo: value } });
  }

  // ---------------- RENDER ----------------
  return (
    <section className="section">
      {/* CARD 1 — Objetivo Profissional */}
      <div className="card avoid-break">
        <div className="card-body space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-baseline gap-3">
              <h2 className="text-xl font-semibold">Objetivo Profissional</h2>
              <span
                className={`text-xs transition-transform duration-300 ${
                  fx ? 'scale-105' : ''
                } ${objetivo.length <= MAX_OBJ ? 'text-slate-500' : 'text-red-600'}`}
                id="obj-counter"
              >
                {objetivo.length}/{MAX_OBJ}
              </span>
            </div>

            <ImproveButton
              value={prompt}
              field="objetivo"
              onChange={applyFromAI}
              onLoadingChange={setLoading}
              meta={{
                locale: 'pt-BR',
                domain: 'it',
                roleTarget: lastExp?.cargo || undefined,
                focus: topSkills.join(', ') || undefined,
              }}
            />
          </div>

          <div className="relative">
            <input
              id="pf-objetivo"
              className={`input w-full transition-colors duration-700 ${
                fx ? 'bg-amber-50 ring-1 ring-amber-300' : ''
              } ${loading ? 'opacity-90' : ''} ${
                showObjErr ? 'ring-2 ring-red-500 border-red-500' : ''
              }`}
              placeholder="Ex.: Busco atuar no desenvolvimento de software, contribuindo com qualidade e escalabilidade."
              value={objetivo}
              readOnly={loading}
              aria-invalid={showObjErr}
              aria-describedby="obj-counter"
              onChange={handleChangeObjetivo}
              onBlur={() => setTouched(true)}
            />

            <AIOverlay
              show={loading}
              label="Gerando objetivo…"
              tip="1 frase, até 160 caracteres"
              blockInteraction
            />
          </div>

          {showObjErr && (
            <p className="help text-red-600">{pErrors.objetivo}</p>
          )}
        </div>
      </div>

      {/* CARD 2 — Formação Acadêmica (componente dedicado) */}
      <EducationSection />
    </section>
  );
}
