import React from "react";

type WizardNavProps = {
  canBack: boolean;
  canNext: boolean;
  isLastStep?: boolean; // indica se é a última etapa
  onBack: () => void;
  onNext: () => void;
  onFinish?: () => void; // chamado ao finalizar
  nextLabel?: string; // label do botão próximo
  finishLabel?: string; // label do botão finalizar
};

export default function WizardNav({
  canBack,
  canNext,
  isLastStep = false,
  onBack,
  onNext,
  onFinish,
  nextLabel = "Próximo",
  finishLabel = "Finalizar",
}: WizardNavProps) {
  const handleNext = () => {
    if (isLastStep && onFinish) {
      onFinish();
    } else {
      onNext();
    }
  };

  return (
    <div className="flex justify-between gap-3 pt-4">
      <button
        type="button"
        disabled={!canBack}
        aria-disabled={!canBack}
        onClick={onBack}
        className="px-4 py-2 rounded-xl border disabled:opacity-50"
      >
        Voltar
      </button>

      <button
        type="button"
        disabled={!canNext}
        aria-disabled={!canNext}
        onClick={handleNext}
        className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-700 text-white disabled:opacity-50"
      >
        {isLastStep ? finishLabel : nextLabel}
      </button>
    </div>
  );
}
