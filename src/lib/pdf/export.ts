// src/lib/pdf/export.ts
// PDF A4 multipágina alinhado às margens do @page (ABNT/Modern).
// - Evita "fora de esquadro" usando a largura total de 210mm e (0,0) como origem.
// - Fatia o canvas verticalmente em blocos na razão 210x297.
// - Compatível com Review.tsx: elementToPDF / elementToPNG.

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export type ExportOptions = {
  fileName?: string; // sem extensão; será adicionado .pdf
  scale?: number; // escala do html2canvas (2 recomendado)
  imageQuality?: number; // JPEG [0..1]
  pageBackground?: string; // fundo ao rasterizar
};

const A4_W_MM = 210;
const A4_H_MM = 297;

// Conversão px/mm (96 dpi CSS)
const MM_TO_PX = 3.779527559055;

// ========= helpers =========
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function ensureExt(name: string, ext: string) {
  return name.toLowerCase().endsWith(`.${ext}`) ? name : `${name}.${ext}`;
}

async function rasterize(
  el: HTMLElement,
  { scale = 2, pageBackground = '#ffffff' }: Partial<ExportOptions> = {},
) {
  // Usa o tamanho real do elemento (sem forçar largura).
  const canvas = await html2canvas(el, {
    scale,
    backgroundColor: pageBackground,
    useCORS: true,
    allowTaint: false,
    logging: false,
    windowWidth: el.scrollWidth, // evita interferência de zoom
    windowHeight: el.scrollHeight,
  });
  return canvas;
}

function sliceCanvasVertical(src: HTMLCanvasElement, sliceHeight: number) {
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
    y += h;
  }
  return slices;
}

// ================== API pública ==================
export async function elementToPDF(el: HTMLElement, opts: ExportOptions = {}) {
  const {
    fileName = 'Curriculo',
    scale = 2,
    imageQuality = 0.92,
    pageBackground = '#ffffff',
  } = opts;

  const canvas = await rasterize(el, { scale, pageBackground });

  // Cálculo do "pageHeightPx" mantendo proporção 210x297 pela largura do canvas.
  // Assim garantimos que cada fatia ocupa exatamente uma página A4.
  const pageHeightPx = Math.round((A4_H_MM / A4_W_MM) * canvas.width);
  const slices = sliceCanvasVertical(canvas, pageHeightPx);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
    putOnlyUsedFonts: true,
  });

  // Renderiza cada fatia ocupando toda a página (0,0, 210x297).
  slices.forEach((cnv, idx) => {
    const imgData = cnv.toDataURL('image/jpeg', clamp(imageQuality, 0.5, 1));
    if (idx > 0) doc.addPage('a4', 'portrait');
    doc.addImage(imgData, 'JPEG', 0, 0, A4_W_MM, A4_H_MM);
  });

  doc.save(ensureExt(fileName, 'pdf'));
}

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
