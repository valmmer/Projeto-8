type Step = { id: number; label: string };

export default function Stepper({
  steps,
  current,
}: {
  steps: Step[];
  current: number;
}) {
  return (
    <div className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur mb-4">
      <ol className="flex items-center gap-3 p-3">
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={s.id} className="flex items-center gap-2">
              <span
                className={[
                  'w-7 h-7 rounded-full grid place-items-center text-sm font-semibold',
                  done
                    ? 'bg-brand-500 text-white'
                    : active
                    ? 'bg-brand-700 text-white'
                    : 'bg-slate-200 text-slate-600',
                ].join(' ')}
                aria-current={active ? 'step' : undefined}
                title={s.label}
              >
                {s.id}
              </span>
              <span
                className={
                  active ? 'font-semibold' : 'text-slate-600 hidden md:inline'
                }
              >
                {s.label}
              </span>
              {i !== steps.length - 1 && (
                <span className="mx-2 w-10 border-t border-slate-300" />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
