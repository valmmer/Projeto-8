// src/components/Review.tsx
// ----------------------------------------------------------------------------
// Painel de "Revisão Final"
// - Troca de template (Clássico ABNT | Modern Clean)
// - Imprimir (usa @media print do CSS)
// - PDF paginado (export.ts fatia o canvas por página, sem tarjas)
// ----------------------------------------------------------------------------

<<<<<<< HEAD
export default function Review() {

  // 👉 Aqui declaramos a função handleVoltar
  const handleVoltar = () => {
    window.history.back(); // ou outro comportamento que você quiser

=======
import React, { useRef, useState } from 'react';
import ResumePreview, { type ResumeTemplateId } from './preview/ResumePreview';
import { exportElementToPDF } from '../lib/pdf/export';
import { useResume } from '../state/ResumeContext';

type Props = {
  template: ResumeTemplateId;
  onTemplateChange: (t: ResumeTemplateId) => void;
};

function slug(s: string) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export default function Review({ template, onTemplateChange }: Props) {
>>>>>>> 78c7747 (Melhorias Visuais import e PDF)
  const cvRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const { state } = useResume();

  async function gerarPDF() {
    const wrap = cvRef.current;
    if (!wrap) {
      alert('Não foi possível localizar o preview.');
      return;
    }

    // 🎯 Exporta exatamente a página A4/ABNT
    const page =
      wrap.querySelector<HTMLElement>('#cv-page') ??
      wrap.querySelector<HTMLElement>('.page') ??
      wrap;

    // debug opcional
    console.debug(
      '[pdf] target size:',
      page.clientWidth,
      'x',
      page.clientHeight,
    );

    try {
      setSaving(true);
      const nome = slug(state?.dados?.nome || 'Curriculo');
      await exportElementToPDF(page, `${nome}.pdf`);
    } catch (e) {
      console.error('[pdf] erro:', e);
      alert('Não foi possível gerar o PDF agora.');
    } finally {
      setSaving(false);
    }
<<<<<<< HEAD

  };

  return (
    <div className="space-y-4">

      <div className="flex justify-between items-center no-print">
        <h2 className="text-xl font-semibold">Revisão Final</h2>
        <button onClick={() => window.print()} className="btn btn-outline">
          Imprimir / PDF
        </button>
      </div>

      <div className="card print-full">
        <div className="card-body">
          <Preview />
        </div>
      </div>

      {/* Voltar - com no-print para esconder na impressão */}
      <div className="no-print">
        <button className="btn btn-outline" onClick={handleVoltar}>
          Voltar
        </button>

      {/* Cabeçalho e botões */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Revisão Final</h2>
        <div className="space-x-2">
          <button
            onClick={() => window.print()}
            className="btn btn-outline"
          >
            Imprimir
          </button>
          <button
            onClick={gerarPDF}
            className="btn btn-primary"
          >
            Gerar PDF
          </button>
        </div>
      </div>

      {/* Container capturado pelo PDF */}
      <div
        ref={cvRef}
        className="bg-white p-6 rounded shadow-lg w-full min-h-[600px] print-container"
        style={{ overflow: "visible" }} // evita cortar conteúdo
      >
        <Preview />

=======
  }

  return (
    <section className="card" aria-busy={saving}>
      {/* Toolbar superior */}
      <div className="preview-toolbar">
        <label className="text-sm text-slate-600 mr-2">Modelo</label>
        <select
          className="input !h-8 !py-0 mr-3"
          value={template}
          onChange={(e) =>
            onTemplateChange(e.currentTarget.value as ResumeTemplateId)
          }
          title="Modelo de currículo"
          disabled={saving}
        >
          <option value="classico">Clássico ABNT</option>
          <option value="clean">Moderno Clean</option>
        </select>

        <button
          className="btn btn-outline"
          onClick={() => window.print()}
          disabled={saving}
        >
          Imprimir
        </button>
        <button
          className="btn btn-primary"
          onClick={gerarPDF}
          disabled={saving}
        >
          {saving ? 'Gerando…' : 'Gerar PDF'}
        </button>
      </div>

      {/* Corpo com o canvas A4 */}
      <div className="preview-body">
        <div
          ref={cvRef}
          className="preview-canvas"
          style={{ transform: 'scale(1)' }}
        >
          {/* ⚠️ Nos templates, o root deve ser:
              <div id="cv-page" className="page abnt"> ... </div> */}
          <ResumePreview template={template} />
        </div>
>>>>>>> 78c7747 (Melhorias Visuais import e PDF)
      </div>
    </section>
  );
}
