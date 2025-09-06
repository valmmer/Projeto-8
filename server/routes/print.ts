// server/routes/print.ts
import { Router } from 'express';

export const printRouter = Router();

/**
 * POST /api/print/pdf
 * Body:
 *  {
 *    url?: string;           // opção 1: abrir a URL pública (recomendado)
 *    html?: string;          // opção 2: HTML inline (injeta <base> p/ assets)
 *    fileName?: string;      // nome do arquivo sem .pdf (default: "curriculo")
 *    selector?: string;      // ex.: "#cv-page" → imprime só esse nó
 *    addExportingClass?: boolean; // default true → adiciona "exporting" no selector
 *  }
 */
printRouter.post('/pdf', async (req, res) => {
  const {
    url,
    html,
    fileName,
    selector = '#cv-page',
    addExportingClass = true,
  } = req.body ?? {};

  if (!url && !html) {
    return res.status(400).json({ error: 'Envie "url" ou "html".' });
  }

  // Detecta melhor a base p/ assets quando usar HTML inline
  const baseHref =
    req.get('origin') ||
    `${req.protocol}://${req.get('host')}` ||
    process.env.PRINT_BASE_URL ||
    '';

  const safeName = sanitizeFileName(fileName || 'curriculo') + '.pdf';

  let browser: any = null;
  try {
    const { default: puppeteer } = await import('puppeteer');

    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--font-render-hinting=none',
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });

    // Respeita @media print/@page
    await page.emulateMediaType('print');

    if (url) {
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 60_000 });
    } else {
      const content = injectBase(String(html), baseHref);
      await page.setContent(content, { waitUntil: 'networkidle0' });
    }

    // Aguarda #cv-page (ou o seletor pedido)
    await page.waitForSelector(selector, { timeout: 30_000 });

    // Opcional: adiciona classe "exporting" no alvo (esconde placeholders e zera padding via CSS seu)
    if (addExportingClass) {
      await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (el) el.classList.add('exporting');
      }, selector);
    }

    // Injeta CSS de impressão para:
    // - imprimir somente o selector
    // - zerar padding de .content (não somar com @page)
    // - não anexar URL após links
    // - garantir cores/fundos
    await page.addStyleTag({
      content: `
        @media print {
          /* imprime somente o alvo */
          body > * { display: none !important; }
          ${selector} { display: block !important; }
          ${selector}, ${selector} * { visibility: visible !important; }

          /* nunca somar padding da área útil */
          .page .content { padding: 0 !important; }

          /* evitar URL após links */
          a[href]::after, a[href]::before { content: none !important; }

          /* preservar cores/fundos */
          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `.trim(),
    });

    // Aguarda imagens e fontes
    await waitForImagesAndFonts(page);

    // (robustez extra) espere estilos computados da tipografia ABNT
    // Ex.: garante que .page.abnt está aplicado
    await page.waitForFunction(
      (sel) => {
        const el = document.querySelector(sel);
        if (!el) return false;
        const fam = getComputedStyle(el).fontFamily.toLowerCase();
        return fam.includes('times'); // Times 12pt ABNT
      },
      { timeout: 10_000 },
      selector,
    );

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true, // respeita @page do seu print.css
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
    res.send(pdf);
  } catch (err: any) {
    console.error('[print] erro:', err);
    res.status(500).json({ error: err?.message ?? 'Erro ao gerar PDF' });
  } finally {
    if (browser) await browser.close();
  }
});

/* ---------------- helpers ---------------- */

function sanitizeFileName(s: string) {
  return String(s)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function injectBase(html: string, baseHref: string) {
  if (!baseHref) return html;
  if (/<base\s/i.test(html)) return html; // já existe <base>
  if (/<head[\s>]/i.test(html)) {
    return html.replace(
      /<head(\s[^>]*)?>/i,
      (m) => `${m}\n<base href="${baseHref}">`,
    );
  }
  if (/<html(\s[^>]*)?>/i.test(html)) {
    return html.replace(
      /<html(\s[^>]*)?>/i,
      (m) => `${m}\n<head><base href="${baseHref}"></head>`,
    );
  }
  return `<head><base href="${baseHref}"></head>${html}`;
}

async function waitForImagesAndFonts(page: import('puppeteer').Page) {
  await page.evaluate(async () => {
    const imgs = Array.from(document.images || []);
    await Promise.all(
      imgs.map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete) return resolve();
            img.addEventListener('load', () => resolve(), { once: true });
            img.addEventListener('error', () => resolve(), { once: true });
          }),
      ),
    );
    // @ts-ignore
    if (document?.fonts?.ready) {
      // @ts-ignore
      await document.fonts.ready;
    }
  });
}
