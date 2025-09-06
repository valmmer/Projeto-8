// src/components/Review.tsx
import React, { useRef, useState } from 'react';
import ResumePreview, { type ResumeTemplateId } from './preview/ResumePreview';
import { elementToPDF, elementToPNG } from '../lib/pdf/export';
import { useResume } from '../state/ResumeContext';
import { downloadServerPDF } from '../lib/serverPrint';

type Props = {
  template: ResumeTemplateId;
  onTemplateChange: (t: ResumeTemplateId) => void;
};
type Busy = null | 'pdf' | 'png' | 'server';

function slug(s: string) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function getPageEl(wrap: HTMLElement | null): HTMLElement | null {
  if (!wrap) return null;
  return (
    wrap.querySelector<HTMLElement>('#cv-page') ??
    wrap.querySelector<HTMLElement>('.page') ??
    null
  );
}

// Adiciona .exporting e remove temporariamente o transform do preview
async function runWithExporting(page: HTMLElement, task: () => Promise<void>) {
  // wrapper do preview que costuma ter transform: scale(...)
  const previewCanvas = page.closest<HTMLElement>('.preview-canvas');
  const prevTransform = previewCanvas?.style.transform;

  try {
    page.classList.add('exporting'); // ativa regras do print.css p/ export
    if (previewCanvas) previewCanvas.style.transform = 'none'; // evita distorção
    await task();
  } finally {
    if (previewCanvas) previewCanvas.style.transform = prevTransform || '';
    page.classList.remove('exporting');
  }
}

export default function Review({ template, onTemplateChange }: Props) {
  const cvWrapRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<Busy>(null);
  const { state } = useResume();

  async function handleExportPDF() {
    if (busy) return;
    const page = getPageEl(cvWrapRef.current);
    if (!page) return alert('Não foi possível localizar o preview (#cv-page).');

    setBusy('pdf');
    const nome = slug(state?.dados?.nome || 'Curriculo');
    try {
      await runWithExporting(page, async () => {
        await elementToPDF(page, { fileName: nome });
      });
    } catch (e) {
      console.error('[pdf] erro:', e);
      alert('Não foi possível gerar o PDF agora.');
    } finally {
      setBusy(null);
    }
  }

  async function handleExportPNG() {
    if (busy) return;
    const page = getPageEl(cvWrapRef.current);
    if (!page) return;

    setBusy('png');
    const nome = slug(state?.dados?.nome || 'Curriculo');
    try {
      await runWithExporting(page, async () => {
        await elementToPNG(page, nome);
      });
    } catch (e) {
      console.error('[png] erro:', e);
      alert('Não foi possível gerar a imagem agora.');
    } finally {
      setBusy(null);
    }
  }

  async function handleServerPDF() {
    if (busy) return;
    const page = getPageEl(cvWrapRef.current);
    if (!page) return alert('Não foi possível localizar o preview (#cv-page).');

    setBusy('server');
    const nome = slug(state?.dados?.nome || 'Curriculo');
    try {
      await runWithExporting(page, async () => {
        try {
          await (
            downloadServerPDF as unknown as (
              url?: string,
              opts?: any,
            ) => Promise<void>
          )(window.location.href, { fileName: nome, selector: '#cv-page' });
        } catch {
          await (
            downloadServerPDF as unknown as (url?: string) => Promise<void>
          )(window.location.href);
        }
      });
    } catch (e) {
      console.error('[server-pdf] erro:', e);
      alert('Falha ao gerar PDF no servidor.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="card" aria-busy={!!busy}>
      <div className="preview-toolbar">
        <label className="text-sm text-slate-600 mr-2">Modelo</label>
        <select
          className="input !h-8 !py-0 mr-3"
          value={template}
          onChange={(e) =>
            onTemplateChange(e.currentTarget.value as ResumeTemplateId)
          }
          title="Modelo de currículo"
          disabled={!!busy}
        >
          <option value="classico">Clássico ABNT</option>
          <option value="modern">Moderno Clean</option>
        </select>

        <button
          className="btn btn-outline"
          onClick={() => window.print()}
          disabled={!!busy}
          title="Imprimir / Salvar como PDF (nativo)"
        >
          Imprimir
        </button>

        <button
          className="btn btn-primary"
          onClick={handleExportPDF}
          disabled={!!busy}
          title="Gerar PDF via html2canvas + jsPDF"
        >
          {busy === 'pdf' ? 'Gerando…' : 'Gerar PDF'}
        </button>

        <button
          className="btn btn-secondary"
          onClick={handleServerPDF}
          disabled={!!busy}
          title="Gerar via servidor (Puppeteer)"
        >
          {busy === 'server' ? 'Gerando…' : 'Gerar PDF (Servidor)'}
        </button>

        <button
          className="btn"
          onClick={handleExportPNG}
          disabled={!!busy}
          title="Exportar visual como PNG"
        >
          {busy === 'png' ? 'Gerando…' : 'Exportar PNG'}
        </button>
      </div>

      <div className="preview-body">
        <div
          ref={cvWrapRef}
          className="preview-canvas"
          style={{ transform: 'scale(1)' }}
        >
          {/* O template renderiza <div id="cv-page" class="page abnt|modern"><div id="cv-content" class="content">… */}
          <ResumePreview template={template} />
        </div>
      </div>
    </section>
  );
}
