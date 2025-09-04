// src/lib/pdf/export.ts
// -----------------------------------------------------------------------------
// Exporta um elemento .page para PDF A4 fatiando o canvas apenas em pontos
// "seguros" (fim de parágrafo, <li>, .entry, etc.) e respeitando zonas .no-split.
// Requisitos no HTML para melhor resultado:
//  - Root do currículo: <article className="page abnt">…</article>
//  - Cada item grande (experiência/edu/cert/idioma): wrapper .entry.no-split
//  - Títulos de seção: .keep-with-next (mantém título junto do primeiro item)
//  - Quebra manual quando quiser: <div className="page-break" />
// -----------------------------------------------------------------------------

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const MAX_CANVAS_DIM = 16384;

// margem de segurança antes do fim da página (evita corte bem no meio da linha)
const SAFETY_MARGIN_PX = 50;
// overlap de 1px entre páginas para não aparecer linha de emenda
const PAGE_OVERLAP_PX = 1;

// Escala máxima sem ultrapassar o limite de 16k do canvas
function clampCanvasScale(el: HTMLElement): number {
  const r = el.getBoundingClientRect();
  const desired = Math.max(2, window.devicePixelRatio || 1);
  const maxByW = Math.max(1, Math.floor(MAX_CANVAS_DIM / Math.max(1, Math.ceil(r.width))));
  const maxByH = Math.max(1, Math.floor(MAX_CANVAS_DIM / Math.max(1, Math.ceil(r.height))));
  return Math.max(1, Math.min(desired, maxByW, maxByH));
}

// Top relativo ao root (px)
function relTop(el: Element, root: HTMLElement): number {
  const er = (el as HTMLElement).getBoundingClientRect();
  const rr = root.getBoundingClientRect();
  return Math.round(er.top - rr.top);
}

// Bottom relativo ao root (px)
function relBottom(el: Element, root: HTMLElement): number {
  const er = (el as HTMLElement).getBoundingClientRect();
  const rr = root.getBoundingClientRect();
  return Math.round(er.bottom - rr.top);
}

// Ordena e remove valores muito próximos (tol)
function dedupeSorted(nums: number[], tol = 2): number[] {
  const arr = Array.from(new Set(nums)).sort((a, b) => a - b);
  const out: number[] = [];
  for (const v of arr) {
    if (out.length === 0 || Math.abs(v - out[out.length - 1]) > tol) out.push(v);
  }
  return out;
}

export async function exportElementToPDF(rootEl: HTMLElement, filename = 'Curriculo.pdf') {
  // 1) Espera fontes — evita reflow/metrificação diferente no raster
  try {
    const f = (document as any).fonts;
    if (f?.ready) await f.ready;
  } catch { /* noop */ }

  // 2) Marca o elemento alvo (CSS “safe” só no subtree marcado do clone)
  const MARK = 'data-pdf-el';
  const had = rootEl.hasAttribute(MARK);
  if (!had) rootEl.setAttribute(MARK, '1');

  // 3) Coleta de marcadores **no DOM real**
  const page: HTMLElement = rootEl;

  // 3.a) Marcadores explícitos (.page-break)
  const explicitBreaks = Array.from(page.querySelectorAll('.page-break'))
    .map((n) => relTop(n, page));

  // 3.b) Pontos “seguros” (fim de blocos/linhas) — preferimos cortar após eles
  const SAFE_END_SELECTORS = [
    '.entry',        // wrappers de itens grandes com .no-split
    '.abnt p',       // parágrafos
    '.abnt li',      // itens de lista
    'h1','h2','h3',
    '.sec', 'hr',
    '.section'
  ].join(',');

  const safeEnds: number[] = Array.from(page.querySelectorAll(SAFE_END_SELECTORS))
    .map((el) => relBottom(el, page))
    .filter((v) => Number.isFinite(v) && v > 0);

  // 3.c) Zonas proibidas: .no-split (não pode cortar “dentro”)
  const noSplitZones: Array<[number, number]> = Array.from(
    page.querySelectorAll<HTMLElement>('.no-split')
  )
    .map((el) => {
      const t = relTop(el, page);
      const b = relBottom(el, page);
      return [t, b] as [number, number];
    })
    .filter(([t, b]) => Number.isFinite(t) && Number.isFinite(b) && b > t);

  // 3.d) Consolida e deduplica marcadores
  const markers = dedupeSorted([...explicitBreaks, ...safeEnds]);

  // 4) Rasterização com CSS seguro no clone
  const scale = clampCanvasScale(page);
  const canvas = await html2canvas(page, {
    scale,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    imageTimeout: 0,
    scrollY: -window.scrollY,
    windowWidth: document.documentElement.clientWidth,
    windowHeight: document.documentElement.clientHeight,
    onclone: (doc) => {
      // CSS seguro: sem oklch/gradientes/sombras/animações
      const style = doc.createElement('style');
      style.textContent = `
        html, body { background: #fff !important; }
        [${MARK}], [${MARK}] * {
          color: #0f172a !important;
          background: transparent !important;
          background-color: #fff !important;
          background-image: none !important;
          border-color: #cbd5e1 !important;
          box-shadow: none !important;
          filter: none !important;
          letter-spacing: normal !important;
        }
        [${MARK}] { font-family: "Times New Roman", Times, Georgia, serif !important; }
        [${MARK}] p { margin: 0 0 6pt !important; }
        [${MARK}] .ai-shimmer { animation: none !important; }
      `;
      doc.head.appendChild(style);
      doc.querySelector<HTMLElement>(`[${MARK}]`)?.classList.add('for-pdf');
    },
  }).finally(() => { if (!had) rootEl.removeAttribute(MARK); });

  // 5) Conversão px->mm e altura útil da página em px
  const wpx = canvas.width;
  const hpx = canvas.height;
  const mmPerPx = A4_WIDTH_MM / wpx;
  const pageHeightPx = Math.floor(A4_HEIGHT_MM / mmPerPx);

  // 6) Auxiliares de “snapping”
  const insideNoSplit = (y: number) =>
    noSplitZones.some(([t, b]) => y > t && y < b);

  function bestCut(yStart: number): number {
    const natural = yStart + pageHeightPx;

    // maior marker <= natural e > yStart + SAFETY_MARGIN_PX
    let idx = -1;
    for (let i = markers.length - 1; i >= 0; i--) {
      const m = markers[i];
      if (m <= natural && m > yStart + SAFETY_MARGIN_PX) { idx = i; break; }
    }
    if (idx === -1) return natural;

    let cut = markers[idx];
    while (insideNoSplit(cut) && idx > 0) {
      idx--;
      cut = markers[idx];
    }
    return cut > yStart ? cut : natural;
  }

  // 7) Fatiar o canvas respeitando os cortes
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });

  let y = 0;
  let pageIndex = 0;
  const minPageContent = Math.floor(pageHeightPx * 0.45); // evita página com quase nada

  while (y < hpx) {
    const natural = y + pageHeightPx;
    let cut = Math.min(bestCut(y), hpx);

    // conteúdo mínimo (exceto última)
    if (cut - y < minPageContent && cut < hpx) {
      const nextIdx = markers.findIndex((m) => m > cut);
      if (nextIdx !== -1) {
        const nextCut = Math.min(markers[nextIdx], hpx);
        if (nextCut - y <= pageHeightPx * 1.35) cut = nextCut;
      }
    }

    // fallback absoluto para evitar loop (se algo deu errado)
    if (cut <= y) cut = Math.min(natural, hpx);

    // fatia com overlap
    const sliceTop = Math.max(0, y - (pageIndex > 0 ? PAGE_OVERLAP_PX : 0));
    const sliceH = Math.min(hpx - sliceTop, cut - sliceTop);

    const slice = document.createElement('canvas');
    slice.width = wpx;
    slice.height = sliceH;
    const ctx = slice.getContext('2d')!;
    ctx.drawImage(canvas, 0, sliceTop, wpx, sliceH, 0, 0, wpx, sliceH);

    const img = slice.toDataURL('image/png');
    const hMm = sliceH * mmPerPx;

    if (pageIndex === 0) {
      pdf.addImage(img, 'PNG', 0, 0, A4_WIDTH_MM, hMm);
    } else {
      pdf.addPage('a4');
      pdf.addImage(img, 'PNG', 0, 0, A4_WIDTH_MM, hMm);
    }

    pageIndex += 1;
    y = cut;
  }

  pdf.save(filename);
}
