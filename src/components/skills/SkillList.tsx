import type { Skill } from '../../types';

type Props = {
  items: Skill[];
  onRemove: (id: string, label: string) => void;
};

/**
 * Lista agrupada (Hard / Soft) exibida como chips.
 * Se `tipo` vier undefined, tratamos como Hard para agrupamento/compat.
 */
export default function SkillList({ items, onRemove }: Props) {
  const hard = items.filter((s) => s.tipo !== 'Soft');
  const soft = items.filter((s) => s.tipo === 'Soft');

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <p className="text-slate-500">Nenhuma habilidade adicionada.</p>
      ) : (
        <>
          <div>
            <h3 className="text-sm font-semibold text-slate-600 mb-2">
              Hard Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {hard.map((s) => {
                const dotClass =
                  s.nivel === 'Avançado'
                    ? 'bg-emerald-600'
                    : s.nivel === 'Intermediário'
                      ? 'bg-amber-500'
                      : 'bg-slate-400';
                return (
                  <span key={s.id} className="badge">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${dotClass}`}
                    />
                    <span className="mx-1">{s.nome}</span>
                    <span className="text-slate-600">— {s.nivel}</span>
                    <button
                      type="button"
                      className="ml-2 text-xs text-red-700 border border-red-600 rounded px-1.5 py-0.5 hover:bg-red-50"
                      onClick={() => onRemove(s.id, s.nome)}
                      aria-label={`Remover ${s.nome} (${s.nivel})`}
                      title="Remover"
                    >
                      Remover
                    </button>
                  </span>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-600 mb-2">
              Soft Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {soft.map((s) => {
                const dotClass =
                  s.nivel === 'Avançado'
                    ? 'bg-emerald-600'
                    : s.nivel === 'Intermediário'
                      ? 'bg-amber-500'
                      : 'bg-slate-400';
                return (
                  <span key={s.id} className="badge">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${dotClass}`}
                    />
                    <span className="mx-1">{s.nome}</span>
                    <span className="text-slate-600">— {s.nivel}</span>
                    <button
                      type="button"
                      className="ml-2 text-xs text-red-700 border border-red-600 rounded px-1.5 py-0.5 hover:bg-red-50"
                      onClick={() => onRemove(s.id, s.nome)}
                      aria-label={`Remover ${s.nome} (${s.nivel})`}
                      title="Remover"
                    >
                      Remover
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
