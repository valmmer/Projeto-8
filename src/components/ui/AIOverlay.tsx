

type Props = {
  show: boolean;
  label?: string;
  tip?: string;
  blockInteraction?: boolean; // true = bloqueia clique/teclado
};

export default function AIOverlay({
  show,
  label = 'Melhorando seu texto…',
  tip,
  blockInteraction = true,
}: Props) {
  if (!show) return null;

  return (
    <div
      className={`absolute inset-0 z-10 ${blockInteraction ? '' : 'pointer-events-none'}`}
      aria-hidden="false"
      aria-busy="true"
    >
      {/* véu */}
      <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/50 backdrop-blur-sm" />

      {/* barra shimmer no topo */}
      <div className="absolute left-0 right-0 top-0 h-1 overflow-hidden rounded-t-xl">
        <div className="ai-shimmer h-full" />
      </div>

      {/* conteúdo central */}
      <div className="grid h-full place-items-center">
        <div className="flex flex-col items-center gap-2 text-slate-700 dark:text-slate-200">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z" />
            </svg>
            <span role="status" aria-live="polite" aria-atomic="true">{label}</span>
          </div>
          {tip && <p className="text-xs text-slate-500 dark:text-slate-400">{tip}</p>}
        </div>
      </div>
    </div>
  );
}
