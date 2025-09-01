export default function WizardNav({
  canBack,
  canNext,
  onBack,
  onNext,
  nextLabel = 'Próximo',
}: {
  canBack: boolean;
  canNext: boolean;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
}) {
  function handleNext() {
    if (!canNext) {
      alert(
        '⚠️ Por favor, complete todos os campos obrigatórios antes de continuar.',
      );
      return;
    }
    onNext();
  }

  return (
    <div className="flex justify-between gap-3 pt-4">
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
        className={`px-4 py-2 rounded-xl text-white disabled:opacity-50 ${
          canNext
            ? 'bg-brand-500 hover:bg-brand-700'
            : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        {nextLabel}
      </button>
    </div>
  );
}