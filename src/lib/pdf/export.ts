// src/lib/pdf/export.ts
// PDF A4 multipágina alinhado às margens do @page (ABNT/Modern).
// - Rasteriza o #cv-page com html2canvas, usa escala baseada no devicePixelRatio,
//   e fatia exatamente no aspecto 210x297 (A4 retrato), com 1px de overlap.
// - Oferece: elementToPDF (baixa), elementToPDFBlob (retorna Blob) e elementToPNG.

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export type ExportOptions = {
  fileName?: string; // nome base do arquivo (sem extensão)
  scale?: number; // escala para o html2canvas (default: DPR arredondado >= 2)
  imageQuality?: number; // qualidade JPEG 0..1 (default: 0.92)
  pageBackground?: string; // fundo durante rasterização (default: #fff)
};

const A4_W_MM = 210;
const A4_H_MM = 297;

// 1px de overlap para evitar linhas brancas entre fatias em alguns viewers
const SLICE_OVERLAP_PX = 1;

// ================== Utils ==================

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function ensureExt(name: string, ext: 'pdf' | 'png' | 'jpg' | 'jpeg') {
  const lower = name.toLowerCase();
  if (lower.endsWith(`.${ext}`)) return name;
  return `${name}.${ext}`;
}

/**
 * Fatia um canvas verticalmente em retângulos de altura targetH,
 * com overlap de 1px entre as fatias (evita “linha branca”).
 */
function sliceCanvasVertical(
  src: HTMLCanvasElement,
  targetH: number,
  overlap = SLICE_OVERLAP_PX,
) {
  const slices: HTMLCanvasElement[] = [];
  let y = 0;

  while (y < src.height) {
    // último pedaço pode ser menor
    const h = Math.min(targetH, src.height - y);
    const cnv = document.createElement('canvas');
    cnv.width = src.width;
    cnv.height = h + (y > 0 ? overlap : 0); // adiciona overlap no topo (exceto primeira)

    const ctx = cnv.getContext('2d')!;
    // recorta da origem Y ajustando se não for a primeira fatia
    const sy = y - (y > 0 ? overlap : 0);
    const sh = h + (y > 0 ? overlap : 0);

    ctx.drawImage(
      src,
      0,
      sy,
      src.width,
      sh, // recorte do original
      0,
      0,
      cnv.width,
      cnv.height, // destino
    );

    slices.push(cnv);
    y += h; // avança para próxima página
  }
  return slices;
}

/**
 * Converte um elemento DOM para canvas de alta qualidade.
 * - useCORS: true → habilita imagens externas com CORS.
 * - scale: se não definido, usa o devicePixelRatio arredondado (>= 2).
 */
async function rasterize(
  el: HTMLElement,
  opts: { scale?: number; pageBackground?: string } = {},
): Promise<HTMLCanvasElement> {
  const dpr = Math.max(2, Math.ceil((window as any).devicePixelRatio || 1));
  const scale = opts.scale ?? dpr;

  return await html2canvas(el, {
    backgroundColor: opts.pageBackground ?? '#ffffff',
    scale, // melhora nitidez (DPI efetivo maior)
    useCORS: true, // permite imagens externas com CORS
    allowTaint: false, // evita cross-origin taint
    logging: false, // menos ruído no console
    imageTimeout: 30000, // tempo para carregar img
    // Dicas para melhor estabilidade:
    removeContainer: true,
    // Se você usar fontes web, já garanta no Review que document.fonts.ready foi aguardado (no server a gente já faz).
  });
}

// ================== API pública ==================

/** Gera e BAIXA o PDF (download imediato) */
export async function elementToPDF(el: HTMLElement, opts: ExportOptions = {}) {
  const {
    fileName = 'Curriculo',
    scale,
    imageQuality = 0.92,
    pageBackground = '#ffffff',
  } = opts;

  const canvas = await rasterize(el, { scale, pageBackground });

  // Altura de página em px mantendo a proporção 210x297 a partir da LARGURA
  const pageHeightPx = Math.round((A4_H_MM / A4_W_MM) * canvas.width);
  const slices = sliceCanvasVertical(canvas, pageHeightPx, SLICE_OVERLAP_PX);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
    putOnlyUsedFonts: true,
  });

  // Cada fatia ocupa a página inteira (0,0, 210x297).
  slices.forEach((cnv, idx) => {
    const imgData = cnv.toDataURL('image/jpeg', clamp(imageQuality, 0.5, 1));
    if (idx > 0) doc.addPage('a4', 'portrait');
    doc.addImage(imgData, 'JPEG', 0, 0, A4_W_MM, A4_H_MM);
  });

  doc.save(ensureExt(fileName, 'pdf'));
}

/** Gera o PDF e retorna como Blob (sem fazer download). Útil para testes/upload. */
export async function elementToPDFBlob(
  el: HTMLElement,
  opts: ExportOptions = {},
): Promise<Blob> {
  const { scale, imageQuality = 0.92, pageBackground = '#ffffff' } = opts;

  const canvas = await rasterize(el, { scale, pageBackground });
  const pageHeightPx = Math.round((A4_H_MM / A4_W_MM) * canvas.width);
  const slices = sliceCanvasVertical(canvas, pageHeightPx, SLICE_OVERLAP_PX);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
    putOnlyUsedFonts: true,
  });

  slices.forEach((cnv, idx) => {
    const imgData = cnv.toDataURL('image/jpeg', clamp(imageQuality, 0.5, 1));
    if (idx > 0) doc.addPage('a4', 'portrait');
    doc.addImage(imgData, 'JPEG', 0, 0, A4_W_MM, A4_H_MM);
  });

  return doc.output('blob');
}

/** Exporta como PNG único (da página inteira, sem fatiar) */
export async function elementToPNG(
  el: HTMLElement,
  fileBaseName = 'Curriculo',
  scale?: number,
) {
  const canvas = await rasterize(el, { scale });
  const link = document.createElement('a');
  link.download = ensureExt(fileBaseName, 'png');
  link.href = canvas.toDataURL('image/png');
  link.click();
}
