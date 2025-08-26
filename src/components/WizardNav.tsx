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
        disabled={!canNext}
        onClick={onNext}
        className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-700 text-white disabled:opacity-50"
      >
        {nextLabel}
      </button>
    </div>
  );
}
