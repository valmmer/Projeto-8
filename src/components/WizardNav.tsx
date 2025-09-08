import Button from './ui/Button';

type Props = {
  // Progresso (opcional — se não vier, esconde o "Etapa X de Y")
  current?: number; // índice 0-based
  total?: number; // total de etapas

  // Flags de habilitação (compat com uso antigo)
  canBack?: boolean;
  canNext?: boolean;

  // Navegação:
  //  - compatibilidade: aceite tanto onPrev quanto onBack
  onPrev?: () => void;
  onBack?: () => void;
  onNext?: () => void;

  onBeforeNext?: () => boolean | Promise<boolean>;

  className?: string;
  prevLabel?: string;
  nextLabel?: string;
  busy?: boolean;
  hidePrev?: boolean;
};

export default function WizardNav({
  current,
  total,
  canBack,
  canNext,
  onPrev,
  onBack,
  onNext,
  onBeforeNext,
  className = '',
  prevLabel = 'Anterior',
  nextLabel = 'Próximo',
  busy = false,
  hidePrev = false,
}: Props) {
  // Fallbacks seguros (evitam NaN)
  const hasNums =
    Number.isFinite(current as number) &&
    Number.isFinite(total as number) &&
    Number(total) > 0;

  const c0 = hasNums ? Number(current) : 0;
  const t0 = hasNums ? Number(total) : 1;

  // Clampa o índice
  const c = Math.min(Math.max(0, c0), t0 - 1);
  const t = t0;

  // Handlers efetivos (compat onPrev/onBack)
  const handlePrev = onPrev ?? onBack ?? (() => {});
  const handleNext = async () => {
    if (onBeforeNext) {
      const ok = await onBeforeNext();
      if (!ok) return;
    }
    (onNext ?? (() => {}))();
  };

  // Regras de habilitação
  const prevDisabled = typeof canBack === 'boolean' ? !canBack : c === 0;
  const nextDisabled =
    busy || (typeof canNext === 'boolean' ? !canNext : false);

  return (
    <div
      className={`wizard-nav mt-6 pt-4 border-t flex items-center justify-between gap-3 ${className}`}
    >
      {/* Voltar */}
      <div className="flex items-center">
        {!hidePrev && (
          <Button
            type="button"
            formNoValidate
            variant="secondary"
            onClick={handlePrev}
            disabled={prevDisabled}
            aria-label="Voltar"
          >
            {prevLabel}
          </Button>
        )}
      </div>

      {/* Indicador de etapa */}
      {hasNums ? (
        <div className="text-sm text-neutral-600">
          Etapa {c + 1} de {t}
        </div>
      ) : (
        <div /> // placeholder para manter alinhamento quando não há números
      )}

      {/* Avançar */}
      <div className="flex items-center">
        <Button
          type="button"
          formNoValidate
          onClick={handleNext}
          isLoading={busy}
          disabled={nextDisabled}
          aria-label="Avançar"
        >
          {hasNums && c + 1 === t ? 'Finalizar' : nextLabel}
        </Button>
      </div>
    </div>
  );
}
