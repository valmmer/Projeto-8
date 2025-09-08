// src/pages/BuilderPage.tsx
import { useEffect, useRef, useState } from 'react';
import PersonalForm from '../components/PersonalForm';
import Preview from '../components/preview';

const A4_WIDTH_PX = 794; // ~210mm @ 96dpi

export default function BuilderPage() {
  // zoom manual (quando autoFit=false)
  const [zoom, setZoom] = useState(1);
  // quando true, o zoom é calculado automaticamente pelo espaço disponível
  const [autoFit, setAutoFit] = useState(true);

  // ref da área rolável onde fica o canvas do preview (preview-body)
  const bodyRef = useRef<HTMLDivElement | null>(null);
  // escala calculada pelo auto-fit (apenas para referência/telemetria)
  const [fitScale, setFitScale] = useState(1);

  // Zera qualquer zoom global (--cv-zoom) que possa existir
  useEffect(() => {
    const prev = getComputedStyle(document.documentElement).getPropertyValue(
      '--cv-zoom',
    );
    document.documentElement.style.setProperty('--cv-zoom', '1');
    return () => {
      if (prev) document.documentElement.style.setProperty('--cv-zoom', prev);
      else document.documentElement.style.removeProperty('--cv-zoom');
    };
  }, []);

  // Calcula zoom ideal = (largura útil do body) / largura do A4 (794px)
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;

    const compute = () => {
      // clientWidth JÁ inclui o padding; não subtraia novamente
      const avail = el.clientWidth - 8; // folga p/ scrollbar/rounding
      const raw = avail / A4_WIDTH_PX;
      const scale = Math.max(0.5, Math.min(1, raw));
      setFitScale(scale);
      if (autoFit) setZoom(scale);
    };

    const computeRAF = () => requestAnimationFrame(compute);
    computeRAF();

    // ResizeObserver com fallback
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(computeRAF);
      ro.observe(el);
    } else {
      window.addEventListener('resize', computeRAF);
    }

    const onOrient = () => computeRAF();
    window.addEventListener('orientationchange', onOrient);

    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener('resize', computeRAF);
      window.removeEventListener('orientationchange', onOrient);
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

              {/* Slider SEMPRE habilitado; interagir desliga o autoFit */}
              <input
                className="preview-zoom"
                type="range"
                min={0.5}
                max={1.3}
                step={0.02}
                value={Number(effectiveZoom.toFixed(2))}
                onPointerDown={() => setAutoFit(false)}
                onChange={(e) => {
                  const v = parseFloat(e.currentTarget.value);
                  setZoom(v);
                }}
                title={
                  autoFit
                    ? 'Auto-ajuste ativo — arraste para assumir controle'
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
                className="btn btn-subtle"
                onClick={() => {
                  setZoom(1);
                  setAutoFit(false);
                }}
                title="Zoom 100%"
              >
                100%
              </button>

              {/* Removi o botão Imprimir daqui para evitar duplicado */}
              {/* <button className="btn btn-outline" onClick={handlePrint}>Imprimir</button> */}

              <button
                className="btn btn-primary"
                onClick={() => {
                  // TODO: gerar PDF (html2canvas/jsPDF)
                  // Dica: durante a captura, zere transform da .preview-canvas e restaure depois.
                }}
              >
                Gerar PDF
              </button>
            </div>

            <div className="preview-body" ref={bodyRef}>
              <div
                className="preview-canvas"
                style={{
                  transform: `scale(${effectiveZoom})`,
                  transformOrigin: 'top center',
                  willChange: 'transform',
                }}
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
