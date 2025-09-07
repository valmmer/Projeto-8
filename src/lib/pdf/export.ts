// src/lib/pdf/export.ts
// PDF A4 multipágina alinhado às margens do @page (ABNT/Modern).
// - Usa a largura real do elemento (#cv-page) e fatiamento proporcional (210x297).
// - Overlap de 1px entre fatias evita “linhas brancas” em alguns viewers.
// - Oferece elementToPDF (salva), elementToPDFBlob (retorna Blob) e elementToPNG.

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export type ExportOptions = {
  fileName?: string;      // sem extensão; será adicionado .pdf
  scale?: number;         // escala do html2canvas (2~3 recomendado)
  imageQuality?: number;  // JPEG [0..1]
  pageBackground?: string;// fundo ao rasterizar
};

const A4_W_MM = 210;
const A4_H_MM = 297;

// ---------------- helpers ----------------
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
function ensureExt(name: string, ext: string) {
  return name.toLowerCase().endsWith(`.${ext}`) ? name : `${name}.${ext}`;
}

/**
 * Renderiza o elemento em um canvas respeitando o tamanho real do DOM.
 * Neutralize transforms do preview usando a classe .exporting no layout.
 */
async function rasterize(
  el: HTMLElement,
  {
    scale,
    pageBackground = '#ffffff',
  }: Partial<ExportOptions> = {},
) {
  // Se o chamador não definiu escala, ajusta com base no DPR (limita para não pesar demais).
  const effScale =
    typeof scale === 'number'
      ? scale
      : clamp(Math.max(2, window.devicePixelRatio || 1), 2, 3);

  const canvas = await html2canvas(el, {
    scale: effScale,
    backgroundColor: pageBackground,
    useCORS: true,
    allowTaint: false,
    logging: false,
    windowWidth: el.scrollWidth,   // evita interferência de zoom/scroll
    windowHeight: el.scrollHeight,
    removeContainer: true,
  });
  return canvas;
}

/**
 * Fatia verticalmente o canvas fonte com um pequeno overlap para evitar
 * hairlines entre páginas em alguns leitores de PDF.
 */
function sliceCanvasVertical(
  src: HTMLCanvasElement,
  sliceHeight: number,
  overlap = 1, // 1px de overlap entre as páginas
) {
  const slices: HTMLCanvasElement[] = [];
  const totalHeight = src.height;
  let y = 0;

  while (y < totalHeight) {
    const h = Math.min(sliceHeight, totalHeight - y);
    const page = document.createElement('canvas');
    page.width = src.width;
    page.height = h;
    const ctx = page.getContext('2d')!;
    ctx.drawImage(src, 0, y, src.width, h, 0, 0, src.width, h);
    slices.push(page);
    // próximo y recua 1px para fazer overlap e sumir as linhas
    y += h - (overlap > 0 ? overlap : 0);
  }
  return slices;
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

  // Altura de página em px mantendo a proporção 210x297 de acordo com a LARGURA do canvas.
  const pageHeightPx = Math.round((A4_H_MM / A4_W_MM) * canvas.width);
  const slices = sliceCanvasVertical(canvas, pageHeightPx, 1);

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

/** Igual ao anterior, mas retorna um Blob do PDF (não faz download). */
export async function elementToPDFBlob(
  el: HTMLElement,
  opts: Omit<ExportOptions, 'fileName'> = {},
): Promise<Blob> {
  const {
    scale,
    imageQuality = 0.92,
    pageBackground = '#ffffff',
  } = opts;

  const canvas = await rasterize(el, { scale, pageBackground });
  const pageHeightPx = Math.round((A4_H_MM / A4_W_MM) * canvas.width);
  const slices = sliceCanvasVertical(canvas, pageHeightPx, 1);

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

  // @ts-expect-error: getBlob existe nas versões modernas do jspdf
  const blob: Blob = await new Promise((resolve) => doc.getBlob(resolve));
  return blob;
}

/** Exporta como PNG único (da página inteira, sem fatiar) */
export async function elementToPNG(
  el: HTMLElement,
  fileBaseName = 'Curriculo',
  scale = 2,
) {
  const canvas = await rasterize(el, { scale });
  const link = document.createElement('a');
  link.download = ensureExt(fileBaseName, 'png');
  link.href = canvas.toDataURL('image/png');
  link.click();
}
