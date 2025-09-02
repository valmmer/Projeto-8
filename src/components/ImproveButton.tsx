import { useState, useRef, useEffect } from 'react';
import { improveText, type ImproveField, type ImproveMeta } from '../lib/ai';

type Props = {
  value: string; // texto ou prompt a enviar
  field: ImproveField; // "resumo" | "experiencia" | "objetivo"
  onChange: (newValue: string) => void;
  onLoadingChange?: (loading: boolean) => void;
  meta?: ImproveMeta; // ✅ preset TI e contexto
};

export default function ImproveButton({
  value,
  field,
  onChange,
  onLoadingChange,
  meta,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => controller.current?.abort();
  }, []);

  async function handleClick() {
    if (!value.trim()) {
      setError('O campo está vazio.');
      return;
    }
    setError(null);

    controller.current?.abort();
    controller.current = new AbortController();

    setLoading(true);
    onLoadingChange?.(true);

    try {
      const res = await improveText(value, field, {
        signal: controller.current.signal,
        meta, // ✅ envia preset TI
      });
      if (res.result) onChange(res.result);
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        setError(e?.message || 'Erro ao melhorar o texto.');
      }
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  }

  return (
    <div className="inline-flex flex-col items-end">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="btn btn-outline"
        aria-busy={loading ? 'true' : 'false'}
      >
        {loading ? 'Melhorando...' : '✨ Melhorar'}
      </button>
      {error && <p className="mt-1 text-[12px] text-red-600">{error}</p>}
    </div>
  );
}
