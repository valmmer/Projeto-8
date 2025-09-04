import { useState } from 'react';
import type { SkillLevel } from '../../types';
import type { TipoSkill } from './helpers';

type Props = {
  tipo: TipoSkill;
  nivel: SkillLevel;
  onTipoChange: (t: TipoSkill) => void;
  onNivelChange: (n: SkillLevel) => void;
  onSubmit: (rawText: string, tipo: TipoSkill, nivel: SkillLevel) => void;
  currentCount: number;
  maxCount: number;
};

/**
 * Editor com seletor de Tipo/Nível + campo de texto (aceita múltiplas habilidades).
 * Mantém apenas o estado local do campo `nome`; tipo e nível vêm de cima
 * para também influenciarem as sugestões.
 */
export default function SkillEditor({
  tipo,
  nivel,
  onTipoChange,
  onNivelChange,
  onSubmit,
  currentCount,
  maxCount,
}: Props) {
  const [nome, setNome] = useState('');

  function add() {
    onSubmit(nome, tipo, nivel);
    setNome('');
  }

  function onKeyDownName(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      add();
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div className="field">
        <label className="label" htmlFor="skill-type">
          Tipo
        </label>
        <select
          id="skill-type"
          className="input"
          value={tipo}
          onChange={(e) => onTipoChange(e.target.value as TipoSkill)}
        >
          <option value="Hard">Hard</option>
          <option value="Soft">Soft</option>
        </select>
      </div>

      <div className="field">
        <label className="label" htmlFor="skill-level">
          Nível
        </label>
        <select
          id="skill-level"
          className="input"
          value={nivel}
          onChange={(e) => onNivelChange(e.target.value as SkillLevel)}
        >
          <option>Avançado</option>
          <option>Intermediário</option>
          <option>Básico</option>
        </select>
      </div>

      <div className="field">
        <label className="label" htmlFor="skill-name">
          Habilidade
        </label>
        <input
          id="skill-name"
          className="input"
          placeholder="Ex.: React, SQL, Docker (aceita múltiplas separadas por vírgula)"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          onKeyDown={onKeyDownName}
          aria-describedby="skill-hint"
        />
        <p id="skill-hint" className="help">
          Você pode colar várias separadas por vírgula, ponto e vírgula ou
          ENTER.
        </p>
      </div>

      <div className="md:col-span-3">
        <button
          type="button"
          onClick={add}
          className="btn btn-primary"
          title="Adicionar habilidade(s)"
        >
          Adicionar habilidade
        </button>
        <span className="help ml-3">
          {currentCount}/{maxCount} no total
        </span>
      </div>
    </div>
  );
}
