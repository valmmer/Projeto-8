// WizardNav.tsx
// -----------------------------------------------------------
// Navegação do wizard com proteção de atalhos de teclado:
// - Se o usuário estiver digitando em input/textarea/contentEditable,
//   não deixamos a tecla Space (ou outros atalhos) "subirem" e
//   dispararem ações globais (ex.: avançar etapa).
// - Mantemos comportamento normal dos botões.
// -----------------------------------------------------------

import React from 'react';

type Props = {
  canBack: boolean;
  canNext: boolean;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
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
    // tipos "não-editáveis" (onde Space não deveria virar caractere)
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

export default function WizardNav({
  canBack,
  canNext,
  onBack,
  onNext,
  nextLabel = 'Próximo',
}: Props) {
  function handleNext() {
    if (!canNext) {
      alert(
        '⚠️ Por favor, complete todos os campos obrigatórios antes de continuar.',
      );
      return;
    }
    onNext();
  }

  /**
   * CAPTURA (capturing) de teclas no container:
   * - Se a origem for um campo editável, não deixamos o evento "subir"
   *   para listeners globais que possam chamar preventDefault na barra de espaço.
   * - Isso resolve o caso de a Space ser “comida” por algum atalho global.
   */
  function onKeyDownCapture(e: React.KeyboardEvent<HTMLDivElement>) {
    if (isEditable(e.target)) {
      // Evita que atalhos globais (em App/Window) interceptem a Space
      e.stopPropagation();
      // Não fazemos preventDefault aqui: deixamos o campo inserir a tecla normalmente
      return;
    }

    // (Opcional) atalhos quando NÃO está em campo editável:
    // Enter para avançar e Shift+Enter para voltar
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
  }

  /**
   * Para o botão "Próximo", tratamos Enter/Space quando o próprio
   * botão está focado (comportamento nativo + amigável).
   */
  function onNextKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if ((e.key === 'Enter' || e.key === ' ') && canNext) {
      e.preventDefault(); // evita scroll com Space, etc.
      handleNext();
    }
  }

  return (
    <div
      className="flex justify-between gap-3 pt-4"
      onKeyDownCapture={onKeyDownCapture}
    >
      <button
        type="button"
        disabled={!canBack}
        onClick={onBack}
        className="px-4 py-2 rounded-xl border disabled:opacity-50"
      >
        Voltar
      </button>

      <button
        type="button"
        onClick={handleNext}
        onKeyDown={onNextKeyDown}
        className={`px-4 py-2 rounded-xl text-white disabled:opacity-50 ${
          canNext
            ? 'bg-brand-500 hover:bg-brand-700'
            : 'bg-gray-400 cursor-not-allowed'
        }`}
        aria-disabled={!canNext}
      >
        {nextLabel}
      </button>
    </div>
  );
}
