import type { TipoSkill } from './helpers';

type Props = {
  label: string;
  suggestions: string[];
  tipo: TipoSkill; // Hard ou Soft
  onAdd: (label: string, tipo: TipoSkill) => void;
};

/** Renderiza um grupo de chips clicáveis (Hard ou Soft). */
export default function SuggestionChips({
  label,
  suggestions,
  tipo,
  onAdd,
}: Props) {
  return (
    <div>
      <p className="help mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            className="badge hover:bg-brand-100"
            onClick={() => onAdd(s, tipo)}
            title={`Adicionar ${s}`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
