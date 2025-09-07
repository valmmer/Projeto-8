// Review.tsx
// ————————————————————————————————————————————————————————————————
// O painel de revisão comuta o template (ABNT/Modern) e exporta o #cv-page:
// 1) Botões "ABNT" e "Modern" mudam o template via onTemplateChange.
// 2) "Baixar PDF (Cliente)" usa html2canvas + jsPDF (elementToPDF).
// 3) "Baixar PDF (Servidor)" usa /api/print/pdf (downloadServerPDF).
// 4) Durante a exportação, removemos o transform do preview para evitar skew.
// ————————————————————————————————————————————————————————————————

import React from 'react';
import type { ResumeTemplateId } from './preview/ResumePreview';
import { elementToPDF } from '../lib/pdf/export';
import { downloadServerPDF } from '../lib/serverPrint';

type Props = {
  template: ResumeTemplateId; // 'abnt' | 'modern'
  nomeArquivo?: string; // nome-base do arquivo
  onTemplateChange: (tpl: ResumeTemplateId) => void; // setter vindo do App
};

export default function Review({
  template,
  nomeArquivo = 'Curriculo',
  onTemplateChange,
}: Props) {
  // Executa uma tarefa garantindo que o preview não esteja com transform ativo
  const runWithExporting = async (
    selector: string,
    task: (el: HTMLElement) => Promise<void>,
  ) => {
    const el = document.querySelector(selector) as HTMLElement | null;
    const previewCanvas = document.querySelector(
      '.preview-canvas',
    ) as HTMLElement | null;

    const prevTransform = previewCanvas?.style.transform;
    if (previewCanvas) previewCanvas.style.transform = 'none';
    if (el) el.classList.add('exporting');

    try {
      if (!el) throw new Error(`Elemento não encontrado: ${selector}`);
      await task(el);
    } finally {
      if (el) el.classList.remove('exporting');
      if (previewCanvas) previewCanvas.style.transform = prevTransform || '';
    }
  };

  // PDF no cliente
  const handleClientPDF = async () => {
    await runWithExporting('#cv-page', async (el) => {
      await elementToPDF(el, {
        fileName: nomeArquivo,
        scale: 2,
        imageQuality: 0.95,
      });
    });
  };

  // PDF no servidor (Puppeteer)
  const handleServerPDF = async () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('tpl', template); // envia o template atual na URL

      await runWithExporting('#cv-page', async () => {
        await downloadServerPDF(url.toString(), {
          fileName: nomeArquivo,
          selector: '#cv-page',
        });
      });
    } catch (err: any) {
      console.error('[server-pdf] erro:', err);
      const msg = typeof err?.message === 'string' ? err.message : String(err);
      alert(`Falha ao gerar PDF no servidor:\n${msg}`);
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        {/* Linha de ações: seletor de template + botões de download */}
        <div className="flex flex-wrap items-center gap-2 justify-between">
          {/* Toggle de template */}
          <div className="inline-flex rounded-xl border border-slate-300 overflow-hidden">
            <button
              type="button"
              className={`px-3 py-1.5 text-sm ${
                template === 'abnt' ? 'bg-brand-500 text-white' : 'bg-white'
              }`}
              onClick={() => onTemplateChange('abnt')}
              title="Modelo clássico ABNT"
            >
              ABNT
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 text-sm border-l border-slate-300 ${
                template === 'modern' ? 'bg-brand-500 text-white' : 'bg-white'
              }`}
              onClick={() => onTemplateChange('modern')}
              title="Modelo moderno (2 colunas)"
            >
              Modern
            </button>
          </div>

          {/* Botões de PDF */}
          <div className="flex items-center gap-2">
            <button className="btn btn-outline" onClick={handleClientPDF}>
              Baixar PDF (Cliente)
            </button>
            <button className="btn btn-primary" onClick={handleServerPDF}>
              Baixar PDF (Servidor)
            </button>
          </div>
        </div>

        {/* Preview real continua sendo renderizado fora (no App) */}
      </div>
    </div>
  );
}
