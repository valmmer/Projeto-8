// src/lib/pdf/export.ts
// -----------------------------------------------------------------------------
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

// Margens ABNT (topo/esq = 30; dir/rodapé = 20)
const MARGINS_MM = { top: 30, right: 20, bottom: 20, left: 30 } as const;

// Conversão px/mm (96 dpi CSS)
const MM_TO_PX = 3.779527559055;

/** Garante que fontes & imagens estejam ok antes do raster */
async function waitFontsAndImages(root: HTMLElement) {
  // fontes
  // @ts-ignore
  if (document?.fonts?.ready) {
    // @ts-ignore
    await document.fonts.ready;
  }
  // imagens dentro do root
  const imgs = Array.from(root.querySelectorAll('img'));
  if (imgs.length) {
    await Promise.all(
      imgs.map(
        (img) =>
          new Promise<void>((res) => {
            if (img.complete) return res();
            img.addEventListener('load', () => res(), { once: true });
            img.addEventListener('error', () => res(), { once: true });
          }),
      ),
    );
  }
}

/** Núcleo: exporta apenas a ÁREA ÚTIL (#cv-content) paginada com margens ABNT */
async function exportElementToPDF(
  el: HTMLElement,
  opt: ExportOptions = {},
): Promise<void> {
  const scale = opt.scale ?? 2;
  const imageQuality = opt.imageQuality ?? 0.92;

  // Dimensões úteis (SEM margens)
  const usableWmm = A4_W_MM - MARGINS_MM.left - MARGINS_MM.right; // 160 mm
  const usableHmm = A4_H_MM - MARGINS_MM.top - MARGINS_MM.bottom; // 247 mm
  const usableWpx = Math.round(usableWmm * MM_TO_PX);
  const usableHpx = Math.round(usableHmm * MM_TO_PX);

  // Aguarda fontes/imagens
  await waitFontsAndImages(el);

  // IMPORTANTÍSSIMO: rasterizar exatamente na largura útil (160mm)
  const canvas = await html2canvas(el, {
    scale,
    backgroundColor: opt.pageBackground ?? '#ffffff',
    useCORS: true,
    width: usableWpx, // ← força a largura útil
    windowWidth: usableWpx, // ← garante layout nessa largura
  });

  const fullH = canvas.height; // altura total rasterizada (em px de canvas)
  const sliceW = canvas.width; // agora é coerente com a largura rasterizada
  const sliceH = Math.round(usableHpx * scale); // página útil em px de canvas
  const totalPages = Math.max(1, Math.ceil(fullH / sliceH));

  // Canvas temporário por página
  const pageCanvas = document.createElement('canvas');
  pageCanvas.width = sliceW;
  pageCanvas.height = sliceH;
  const pageCtx = pageCanvas.getContext('2d')!;

  const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true });

  for (let i = 0; i < totalPages; i++) {
    const sy = i * sliceH;
    const sh = Math.min(sliceH, fullH - sy);

    if (pageCanvas.height !== sh) pageCanvas.height = sh;

    pageCtx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
    pageCtx.drawImage(
      canvas,
      0,
      sy, // origem Y no raster
      sliceW,
      sh, // tamanho da fatia
      0,
      0, // destino
      sliceW,
      sh,
    );

    const img = pageCanvas.toDataURL('image/jpeg', imageQuality);
    if (i > 0) pdf.addPage();

    // Tamanho em mm dentro da ÁREA ÚTIL (ajusta última página)
    const imgWmm = usableWmm;
    const imgHmm = (sh / sliceH) * usableHmm;

    pdf.addImage(
      img,
      'JPEG',
      MARGINS_MM.left, // x = 30 mm
      MARGINS_MM.top, // y = 30 mm
      imgWmm,
      imgHmm,
      undefined,
      'FAST',
    );
  }

  pdf.save((opt.fileName ?? 'curriculo') + '.pdf');
}

/** API chamada pelo Review.tsx — recebe #cv-page e acha #cv-content */
export async function elementToPDF(
  el: HTMLElement,
  opt: ExportOptions = {},
): Promise<void> {
  const content =
    el.querySelector<HTMLElement>('#cv-content') ??
    el.querySelector<HTMLElement>('.content') ??
    el;
  return exportElementToPDF(content, opt);
}

/** PNG do que está na tela (aqui pode ser a página inteira) */
export async function elementToPNG(
  el: HTMLElement,
  baseName = 'curriculo',
): Promise<void> {
  // Aguarda fontes/imagens
  await waitFontsAndImages(el);

  const canvas = await html2canvas(el, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
    // Para PNG do preview, mantemos a largura do elemento visível
    width: el.clientWidth || el.scrollWidth || undefined,
  });
  const data = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = data;
  a.download = `${baseName}.png`;
  a.click();
}
