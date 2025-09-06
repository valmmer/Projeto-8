// src/components/skills/SuggestionChips.tsx
import { normKey, type TipoSkill } from './helpers';

type Props = {
  label: string;
  // pode vir bagunçado (número, null, etc.). A gente higieniza.
  suggestions: unknown[];
  tipo: TipoSkill; // "Hard" | "Soft"
  onAdd: (label: string, tipo: TipoSkill) => void;
  /** Opcional: passa um Set com normKey das skills já existentes p/ ocultar chips repetidos */
  excludeKeys?: Set<string>;
};

export default function SuggestionChips({
  label,
  suggestions,
  tipo,
  onAdd,
  excludeKeys,
}: Props) {
  // 1) Sanitiza: coerção para string, trim e remove vazios
  const cleaned: string[] = (Array.isArray(suggestions) ? suggestions : [])
    .map((s) => (typeof s === 'string' ? s : s == null ? '' : String(s)))
    .map((s) => s.trim())
    .filter(Boolean);

  // 2) Dedupe acento/caixa-insensível + filtra já existentes
  const seen = new Set<string>();
  const unique = cleaned.filter((label) => {
    const k = normKey(label); // já normaliza e tira acento
    if (!k) return false;
    if (seen.has(k)) return false;
    if (excludeKeys?.has(k)) return false; // já foi adicionada pelo usuário
    seen.add(k);
    return true;
  });

  return (
    <div>
      <p className="help mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {unique.map((s) => {
          const k = normKey(s);
          return (
            <button
              key={`chip-${k}`}
              type="button"
              className="badge hover:bg-brand-100"
              onClick={() => onAdd(s, tipo)}
              title={`Adicionar ${s}`}
            >
              {s}
            </button>
          );
        })}
      </div>
    </div>
  );
}
