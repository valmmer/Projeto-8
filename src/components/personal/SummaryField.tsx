// src/components/personal/SummaryField.tsx
// ---------------------------------------------------------------------------
// Resumo Profissional (min=180, max=600):
// • Agora aplica maxLength={maxLen} direto no <textarea> (limite duro no UI)
// • Mantém contador, mensagens contextuais e o hack de teclado
// ---------------------------------------------------------------------------

import { useEffect, useRef, useState } from 'react';
import ImproveButton from '../ImproveButton';
import AIOverlay from '../ui/AIOverlay';

const FX_MS = 900;

type Props = {
  value: string;
  onChange: (text: string) => void;
  hasError?: boolean;
  errorText?: string;
  minLen?: number; // default 180
  maxLen?: number; // default 600
  submitted?: boolean; // mostra msg de mínimo após submit
};

function softClamp(text: string, maxLen: number) {
  if (text.length <= maxLen) return text;
  const s = text.slice(0, maxLen + 1);
  const last = s.lastIndexOf(' ');
  return (last > 0 ? s.slice(0, last) : s.slice(0, maxLen)).trim() + '…';
}

export default function SummaryField({
  value,
  onChange,
  hasError = false,
  errorText,
  minLen = 180,
  maxLen = 600,
  submitted = false,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [fx, setFx] = useState(false);

  const ref = useRef<HTMLTextAreaElement | null>(null);
  const valRef = useRef(value);
  useEffect(() => {
    valRef.current = value;
  }, [value]);

  const trimmed = value.trim();
  const tooShort = submitted && trimmed.length > 0 && trimmed.length < minLen;
  const tooLong = value.length > maxLen; // ainda útil p/ indicar no contador (máx. visual)

  const invalid = hasError || tooShort || tooLong;

  const classes =
    `textarea transition-colors duration-700 ` +
    (invalid ? 'ring-2 ring-red-500/20 border-red-500 ' : '') +
    (fx ? 'bg-amber-50 ring-1 ring-amber-300 ' : '') +
    (loading ? 'opacity-90 ' : '');

  function applyAI(text: string) {
    onChange(softClamp(text, maxLen));
    setFx(true);
    window.setTimeout(() => setFx(false), FX_MS);
  }

  // Hack anti espaço (mantido)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const insertAtCaret = (piece: string) => {
      const v = valRef.current ?? '';
      const start = el.selectionStart ?? v.length;
      const end = el.selectionEnd ?? v.length;
      const next = v.slice(0, start) + piece + v.slice(end);
      onChange(next);
      requestAnimationFrame(() =>
        el.setSelectionRange?.(start + piece.length, start + piece.length),
      );
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== ' ' || e.ctrlKey || e.altKey || e.metaKey) return;
      insertAtCaret(' ');
      e.preventDefault();
      e.stopPropagation();
      (e as any).stopImmediatePropagation?.();
    };

    const onBeforeInput = (e: InputEvent) => {
      if (e.inputType !== 'insertText' || e.data !== ' ') return;
      insertAtCaret(' ');
      e.preventDefault?.();
      (e as any).stopPropagation?.();
      (e as any).stopImmediatePropagation?.();
    };

    el.addEventListener('keydown', onKeyDown, { capture: true });
    el.addEventListener('beforeinput', onBeforeInput as EventListener, {
      capture: true,
    });
    return () => {
      el.removeEventListener(
        'keydown',
        onKeyDown as any,
        { capture: true } as any,
      );
      el.removeEventListener(
        'beforeinput',
        onBeforeInput as EventListener,
        { capture: true } as any,
      );
    };
  }, [onChange]);

  return (
    <div className="field mt-5" aria-busy={loading ? 'true' : 'false'}>
      <div className="flex items-center justify-between mb-2">
        <label className="label" htmlFor="pf-resumo">
          Resumo profissional *
          <span className="ml-2 text-xs text-slate-500">
            (mín. {minLen}, máx. {maxLen})
          </span>
        </label>
        <div
          id="resumo-counter"
          className={`text-xs transition-transform duration-300 ${fx ? 'scale-105' : ''} ${tooLong ? 'text-red-600' : 'text-slate-500'}`}
          aria-live="polite"
        >
          {value.length}/{maxLen}
        </div>
      </div>

      <div
        className={`flex justify-end mb-2 ${loading ? 'opacity-60 pointer-events-none' : ''}`}
      >
        <ImproveButton
          value={value}
          field="resumo"
          onChange={applyAI}
          onLoadingChange={setLoading}
        />
      </div>

      <div className="relative">
        <textarea
          id="pf-resumo"
          ref={ref}
          className={classes}
          style={{ whiteSpace: 'pre-wrap' }}
          placeholder={`Entre ${minLen} e ${maxLen} caracteres`}
          value={value}
          readOnly={loading}
          onChange={(e) => onChange(e.currentTarget.value)}
          aria-invalid={invalid || undefined}
          aria-describedby="resumo-counter resumo-help"
          rows={6}
          // 🔒 limite duro no HTML
          maxLength={maxLen}
        />
        <AIOverlay
          show={loading}
          label="Melhorando seu texto…"
          tip="Ajustando clareza e fluidez"
          blockInteraction={true}
        />
      </div>

      <div id="resumo-help" className="mt-1">
        {tooShort && (
          <p className="help text-red-600">
            Mínimo de {minLen} caracteres para um resumo consistente.
          </p>
        )}
        {!tooShort && hasError && (
          <p className="help text-red-600">{errorText}</p>
        )}
        {!tooShort && !hasError && tooLong && (
          <p className="help text-red-600">Máximo de {maxLen} caracteres.</p>
        )}
        {!tooShort && !hasError && !tooLong && (
          <p className="help text-slate-500">
            Dica: foque em resultados, tecnologias e impacto.
          </p>
        )}
      </div>
    </div>
  );
}
