// src/components/SkillsForm.tsx
import { useMemo, useRef, useState } from 'react';
import { useResume, rid } from '../state';
import type { SkillLevel } from '../types';

import {
  HARD_SUGGESTIONS,
  SOFT_SUGGESTIONS,
  LEVEL_ORDER,
  MAX_SKILLS,
} from './skills/constants';
import { normKey, splitBulk, type TipoSkill } from './skills/helpers';
import SkillEditor from './skills/SkillEditor';
import SuggestionChips from './skills/SuggestionChips';
import SkillList from './skills/SkillList';

export default function SkillsForm() {
  const { state, dispatch } = useResume();

  // Estado global do módulo
  const [nivel, setNivel] = useState<SkillLevel>('Básico');
  const [tipo, setTipo] = useState<TipoSkill>('Hard');

  // A11y feedback
  const [msg, setMsg] = useState('');
  const liveRef = useRef<HTMLParagraphElement | null>(null);
  function announce(text: string) {
    setMsg(text);
    requestAnimationFrame(() => {
      const el = liveRef.current;
      if (!el) return;
      el.textContent = '';
      requestAnimationFrame(() => (el.textContent = text));
    });
  }

  // Índice de duplicados por nome
  const existingKeys = useMemo(() => {
    const map = new Set<string>();
    for (const s of state.skills) map.add(normKey(s.nome));
    return map;
  }, [state.skills]);

  // Ordenação para exibir na lista
  const orderedSkills = useMemo(() => {
    const typeOrder = (t?: string) => (t === 'Soft' ? 1 : 0);
    return [...state.skills].sort((a, b) => {
      const byType = typeOrder(a.tipo) - typeOrder(b.tipo);
      if (byType !== 0) return byType;
      const byLevel = LEVEL_ORDER[a.nivel] - LEVEL_ORDER[b.nivel];
      if (byLevel !== 0) return byLevel;
      return a.nome.localeCompare(b.nome, 'pt', { sensitivity: 'base' });
    });
  }, [state.skills]);

  /* ========= Add via texto ========= */
  function addFromText(
    rawText: string,
    chosenTipo: TipoSkill,
    chosenLevel: SkillLevel,
  ) {
    const raw = rawText.trim();
    if (!raw) return;

    const tokens = splitBulk(raw);
    const created: string[] = [];
    const skippedDup: string[] = [];

    let remaining = Math.max(0, MAX_SKILLS - state.skills.length);
    if (remaining === 0) {
      announce(`Limite de ${MAX_SKILLS} habilidades atingido.`);
      return;
    }

    const localSeen = new Set<string>();

    for (const token of tokens) {
      if (remaining <= 0) break;

      const key = normKey(token);
      if (!key) continue;
      if (existingKeys.has(key) || localSeen.has(key)) {
        skippedDup.push(token);
        continue;
      }

      // Para Soft não precisamos de nível na UI — salvamos um default, mas o Preview não mostra.
      const nivelToSave: SkillLevel =
        chosenTipo === 'Soft' ? 'Básico' : chosenLevel;

      dispatch({
        type: 'ADD_SKILL',
        payload: {
          id: rid(),
          nome: token,
          nivel: nivelToSave,
          tipo: chosenTipo,
        },
      });

      created.push(token);
      localSeen.add(key);
      remaining -= 1;
    }

    if (created.length && skippedDup.length) {
      announce(
        `Adicionadas: ${created.join(', ')}. Duplicadas ignoradas: ${skippedDup.join(', ')}.`,
      );
    } else if (created.length) {
      announce(`Adicionadas: ${created.join(', ')}.`);
    } else if (skippedDup.length) {
      announce(`Todas já existiam: ${skippedDup.join(', ')}.`);
    } else {
      announce('Nenhuma habilidade adicionada.');
    }
  }

  /* ========= Add via chip (sugestões) ========= */
  function addSuggestion(label: string, chipTipo: TipoSkill) {
    // limite
    if (state.skills.length >= MAX_SKILLS) {
      announce(`Limite de ${MAX_SKILLS} habilidades atingido.`);
      return;
    }

    const key = normKey(label);
    if (existingKeys.has(key)) {
      announce(`${label} já está na sua lista.`);
      return;
    }

    // Para Soft ignoramos o nível do seletor; Preview não exibe.
    const nivelToSave: SkillLevel = chipTipo === 'Soft' ? 'Básico' : nivel;

    dispatch({
      type: 'ADD_SKILL',
      payload: { id: rid(), nome: label, nivel: nivelToSave, tipo: chipTipo },
    });

    announce(
      `Adicionada: ${label} (${chipTipo}${chipTipo === 'Hard' ? `, ${nivel}` : ''}).`,
    );
  }

  /* ========= Remover ========= */
  function remove(id: string, label: string) {
    dispatch({ type: 'REMOVE_SKILL', payload: id });
    announce(`Removida: ${label}.`);
  }

  return (
    <section className="section">
      <h2 className="text-xl font-semibold">Habilidades</h2>

      {/* Editor */}
      <div className="card">
        <div className="card-body">
          <SkillEditor
            tipo={tipo}
            nivel={nivel}
            onTipoChange={setTipo}
            onNivelChange={setNivel}
            onSubmit={addFromText}
            currentCount={state.skills.length}
            maxCount={MAX_SKILLS}
          />
        </div>
      </div>

      {/* Sugestões */}
      <div className="card">
        <div className="card-body space-y-4">
          <SuggestionChips
            label="Hard Skills (clique para adicionar):"
            suggestions={HARD_SUGGESTIONS}
            tipo="Hard"
            onAdd={addSuggestion}
            excludeKeys={existingKeys}
          />
          <SuggestionChips
            label="Soft Skills (clique para adicionar):"
            suggestions={SOFT_SUGGESTIONS}
            tipo="Soft"
            onAdd={addSuggestion}
            excludeKeys={existingKeys}
          />
        </div>
      </div>

      {/* Lista agrupada */}
      <div className="card">
        <div className="card-body">
          <SkillList items={orderedSkills as any} onRemove={remove} />
        </div>
      </div>

      {/* A11y announcer */}
      <p ref={liveRef} aria-live="polite" className="sr-only">
        {msg}
      </p>
    </section>
  );
}
