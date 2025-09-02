import { useState, useRef, useEffect } from 'react';
import { improveText, type ImproveField } from '../lib/ai';

type Props = {
  value: string;
  field: ImproveField; // "resumo" | "experiencia"
  onChange: (newValue: string) => void;
  onLoadingChange?: (loading: boolean) => void; // ✅ avisa o pai para mostrar overlay
};

export default function ImproveButton({
  value,
  field,
  onChange,
  onLoadingChange,
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
    onLoadingChange?.(true); // ✅ informa o pai

    try {
      const res = await improveText(value, field, {
        signal: controller.current.signal,
      });
      if (res.result) onChange(res.result);
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        setError(e?.message || 'Erro ao melhorar o texto.');
      }
    } finally {
      setLoading(false);
      onLoadingChange?.(false); // ✅ encerra loading no pai
    }
  }

  return (
    <div className="inline-flex flex-col items-end">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="btn btn-outline"
      >
        {loading ? 'Melhorando...' : '✨ Melhorar'}
      </button>
      {error && <p className="mt-1 text-[12px] text-red-600">{error}</p>}
    </div>
  );
}
