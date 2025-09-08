// src/components/preview/ResumePreview.tsx

// ajuste o import conforme seus caminhos/barrel:
import ClassicABNT from './templates/ClassicABNT';
import ModernClean from './templates/ModernClean';

export type ResumeTemplateId = 'abnt' | 'modern';

const TEMPLATES = {
  abnt: ClassicABNT,
  modern: ModernClean,
} as const;

export default function ResumePreview({
  template,
}: {
  template: ResumeTemplateId;
}) {
  const Comp = TEMPLATES[template] ?? ClassicABNT; // fallback

  return (
    <>
      {/* ⚠️ Não coloque wrappers extras aqui; os templates já criam #cv-page/#cv-content */}
      <Comp />

      {/* Hardening: garante tamanho/zoom da folha e desativa escalas herdadas */}
      <style>{`
        /* Folha A4 real, centralizada e nítida */
        #cv-page {
          width: 210mm !important;
          min-height: 297mm !important;
          max-width: none !important;
          margin: 0 auto 2rem auto !important;
          background: #fff !important;
          box-shadow: 0 10px 32px rgba(2,6,23,.10) !important;
          border: 1px solid rgba(2,6,23,.08) !important;
          transform-origin: top center !important;
          transition: transform .16s ease !important;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          /* Zoom controlado por variável global (setada no Review) */
          transform: scale(var(--cv-zoom, 1)) !important;
        }

        /* Se algum ancestral/filho aplicar scale/max-w, neutraliza */
        #cv-page[class*="scale-"],
        #cv-page [class*="scale-"] {
          transform: none !important;
        }
        #cv-page[class*="max-w-"],
        #cv-page [class*="max-w-"] {
          max-width: none !important;
        }

        /* Exportação limpa (PDF/print) */
        #cv-page.exporting {
          box-shadow: none !important;
          border-color: transparent !important;
          transform: none !important; /* 1:1 pro renderizador */
        }

        /* Segurança: imagens responsivas no preview */
        #cv-page img { max-width: 100%; height: auto; }
      `}</style>
    </>
  );
}
