// src/components/WizardNav.tsx
import React from 'react';

type WizardNavProps = {
  canBack: boolean;
  canNext: boolean;
  isLastStep?: boolean; // última etapa?
  onBack: () => void;
  onNext: () => void;
  onFinish?: () => void; // chamado ao finalizar
  nextLabel?: string; // texto do botão "Próximo"
  finishLabel?: string; // texto do botão "Finalizar"
};

/** Verifica se o alvo do evento é um campo editável (onde o usuário digita). */
function isEditable(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  if (el.isContentEditable) return true;
  const tag = el.tagName?.toLowerCase();
  if (tag === 'textarea') return true;
  if (tag === 'input') {
    const type = (el as HTMLInputElement).type?.toLowerCase() || 'text';
    const nonText = [
      'button',
      'submit',
      'reset',
      'checkbox',
      'radio',
      'range',
      'file',
      'color',
      'image',
      'hidden',
    ];
    return !nonText.includes(type);
  }
  return false;
}

const WizardNav: React.FC<WizardNavProps> = ({
  canBack,
  canNext,
  isLastStep = false,
  onBack,
  onNext,
  onFinish,
  nextLabel = 'Próximo',
  finishLabel = 'Finalizar',
}) => {
  const handleNext = () => {
    if (!canNext) {
      alert(
        '⚠️ Por favor, complete todos os campos obrigatórios antes de continuar.',
      );
      return;
    }
    if (isLastStep && onFinish) {
      onFinish();
    } else {
      onNext();
    }
  };

  /**
   * CAPTURA (capturing) de teclas no container:
   * - Se a origem for um campo editável, não deixamos o evento "subir"
   *   para listeners globais que possam capturar a barra de espaço.
   */
  const onKeyDownCapture = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isEditable(e.target)) {
      e.stopPropagation(); // deixa o campo inserir a tecla normalmente
      return;
    }
    // Atalhos quando NÃO está em campo editável:
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleNext();
      return;
    }
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      if (canBack) onBack();
      return;
    }
  };

  /** Teclas quando o botão Próximo/Finalizar está focado */
  const onNextKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if ((e.key === 'Enter' || e.key === ' ') && canNext) {
      e.preventDefault(); // evita scroll com Space
      handleNext();
    }
  };

  const nextBtnClasses = `px-4 py-2 rounded-xl text-white disabled:opacity-50 ${
    canNext
      ? 'bg-brand-500 hover:bg-brand-700'
      : 'bg-gray-400 cursor-not-allowed'
  }`;

  return (
    <div
      className="flex justify-between gap-3 pt-4"
      onKeyDownCapture={onKeyDownCapture}
    >
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
        onKeyDown={onNextKeyDown}
        className={nextBtnClasses}
      >
        {isLastStep ? finishLabel : nextLabel}
      </button>
    </div>
  );
};

export default WizardNav;
