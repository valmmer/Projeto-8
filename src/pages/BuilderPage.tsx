// src/pages/BuilderPage.tsx
import { useEffect, useRef, useState } from 'react';
import PersonalForm from '../components/PersonalForm';
import Preview from '../components/Preview';

export default function BuilderPage() {
  // zoom atual (quando autoFit=false)
  const [zoom, setZoom] = useState(1);
  // quando true, o zoom é calculado automaticamente pelo espaço disponível
  const [autoFit, setAutoFit] = useState(true);

  // ref da área rolável onde fica o canvas do preview (preview-body)
  const bodyRef = useRef<HTMLDivElement | null>(null);
  // escala calculada pelo auto-fit
  const [fitScale, setFitScale] = useState(1);

  // Calcula zoom ideal = (largura útil do body - paddings) / largura do A4 (794px)
  useEffect(() => {
    if (!bodyRef.current) return;

    const el = bodyRef.current;

    const compute = () => {
      const styles = getComputedStyle(el);
      const padX =
        parseFloat(styles.paddingLeft || '0') +
        parseFloat(styles.paddingRight || '0');

      // largura disponível pro canvas
      const avail = el.clientWidth - padX - 8; // -8px de folga pro scrollbars/rounding
      const scale = Math.max(0.6, Math.min(1, avail / 794)); // limita entre 0.6 e 1
      setFitScale(scale);
      // se estamos em autoFit, reflete no zoom visível
      if (autoFit) setZoom(scale);
    };

    // chama agora e quando redimensionar
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    window.addEventListener('orientationchange', compute);
    return () => {
      ro.disconnect();
      window.removeEventListener('orientationchange', compute);
    };
  }, [autoFit]);

  const effectiveZoom = autoFit ? fitScale : zoom;

  return (
    <main className="page-container px-4 md:px-6 py-5">
      <header className="mb-4">
        <h1 className="text-xl md:text-2xl font-semibold">Revisão Final</h1>
      </header>

      <div className="layout-2col">
        {/* Coluna esquerda: formulário/steps */}
        <section className="space-y-6">
          <PersonalForm />
          {/* ...outros steps à esquerda... */}
        </section>

        {/* Coluna direita: preview fixo com toolbar */}
        <aside className="preview-shell">
          <div className="preview-card">
            <div className="preview-toolbar">
              <label className="text-sm text-slate-600 mr-2">Zoom</label>

              {/* Slider desabilitado quando autoFit está ativo */}
              <input
                className="preview-zoom"
                type="range"
                min={0.8}
                max={1.3}
                step={0.05}
                value={Number(effectiveZoom.toFixed(2))}
                onChange={(e) => {
                  const v = parseFloat(e.currentTarget.value);
                  setZoom(v);
                  setAutoFit(false); // ao mexer no slider, desliga auto-fit
                }}
                disabled={autoFit}
                title={
                  autoFit
                    ? 'Ajuste automático ativo'
                    : 'Arraste para ajustar o zoom'
                }
              />

              <button
                className="btn btn-subtle"
                onClick={() => setAutoFit(true)}
                title="Ajustar automaticamente ao painel"
              >
                Ajustar
              </button>

              <button
                className="btn btn-outline"
                onClick={() => window.print()}
              >
                Imprimir
              </button>

              <button
                className="btn btn-primary"
                onClick={() => {
                  // TODO: gerar PDF (html2canvas/jsPDF)
                }}
              >
                Gerar PDF
              </button>
            </div>

            <div className="preview-body" ref={bodyRef}>
              <div
                className="preview-canvas"
                style={{ transform: `scale(${effectiveZoom})` }}
              >
                <Preview />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
