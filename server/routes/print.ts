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
  } = (req.body ?? {}) as {
    url?: string;
    html?: string;
    fileName?: string;
    selector?: string;
    addExportingClass?: boolean;
  };

  if (!url && !html) {
    return res.status(400).json({ error: 'Envie "url" ou "html".' });
  }

  // Base para assets quando usar HTML inline
  const baseHref =
    req.get('origin') ||
    `${req.protocol}://${req.get('host')}` ||
    process.env.PRINT_BASE_URL ||
    '';

  const safeName = sanitizeFileName(fileName || 'curriculo') + '.pdf';

  let browser: any = null;
  try {
    const { default: puppeteer } = await import('puppeteer');

    // ───────────────────────── Launch robusto ─────────────────────────
    const baseArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--font-render-hinting=none',
    ];
    const exePath = (process.env.PUPPETEER_EXECUTABLE_PATH || '').trim();
    const commonOpts: any = {
      args: baseArgs,
      ...(exePath ? { executablePath: exePath } : {}),
    };

    async function tryLaunch(label: string, opts: any) {
      try {
        const b = await puppeteer.launch(opts);
        console.log(`[print] puppeteer.launch OK (${label})`, {
          hasExe: Boolean(exePath),
          headless: opts.headless ?? '(default)',
        });
        return b;
      } catch (e: any) {
        console.warn(`[print] launch FAIL (${label}):`, e?.message || e);
        return null;
      }
    }

    // A) sem especificar headless (default da versão)
    browser = await tryLaunch('A: default headless', { ...commonOpts });
    // B) força headless: true
    if (!browser) {
      browser = await tryLaunch('B: headless=true', {
        ...commonOpts,
        headless: true,
      });
    }
    // C) força headless: false
    if (!browser) {
      browser = await tryLaunch('C: headless=false', {
        ...commonOpts,
        headless: false,
      });
    }
    // D) headless=true + flag single-process (containers mais restritos)
    if (!browser) {
      browser = await tryLaunch('D: headless=true + single-process', {
        ...commonOpts,
        headless: true,
        args: [...baseArgs, '--single-process'],
      });
    }
    if (!browser) {
      throw new Error('Falha ao iniciar o Chromium (todas as tentativas)');
    }
    // ───────────────────────── /Launch robusto ─────────────────────────

    const page = await browser.newPage();
    // A4 @ ~96dpi, com boa nitidez
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });

    // Respeita @media print/@page
    await page.emulateMediaType('print');

    if (url) {
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 60_000 });
    } else {
      const content = injectBase(String(html), baseHref);
      await page.setContent(content, { waitUntil: 'networkidle0' });
    }

    // Aguarda wrapper do preview (ABNT/Modern usam #cv-page)
    await page.waitForSelector(selector, { timeout: 30_000 });

    // Classe "exporting" ativa regras do teu print.css (zera padding etc.)
    if (addExportingClass) {
      await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (el) el.classList.add('exporting');
      }, selector);
    }

    // CSS seguro: usa visibility (não "quebra" ancestrais com display:none)
    await page.addStyleTag({
      content: `
        @media print {
          body * { visibility: hidden !important; }

          ${selector} {
            visibility: visible !important;
            display: block !important;
          }
          ${selector} * { visibility: visible !important; }

          .page .content { padding: 0 !important; }

          a[href]::after, a[href]::before { content: none !important; }

          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `.trim(),
    });

    // Espera imagens e fontes no alvo (evita PDF “vazio”/serrilhado)
    await waitForImagesAndFonts(page, selector);

    // Gera PDF A4 com margens ABNT
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: false, // usa format + margins
      margin: { top: '30mm', right: '20mm', bottom: '20mm', left: '30mm' },
    });

    // Limpa a classe exporting (se reaproveitar a page depois)
    if (addExportingClass) {
      await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (el) el.classList.remove('exporting');
      }, selector);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
    res.send(pdf);
  } catch (err: any) {
    console.error('[print] erro:', err);
    res.status(500).json({ error: err?.message ?? 'Erro ao gerar PDF' });
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {
        /* ignore */
      }
    }
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

async function waitForImagesAndFonts(
  page: import('puppeteer').Page,
  selector: string,
) {
  await page.evaluate(async (sel) => {
    const root = document.querySelector(sel) || document.body;

    // Espera todas as imagens do alvo
    const imgs = Array.from(root.querySelectorAll('img')) as HTMLImageElement[];
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

    // Espera fontes
    // @ts-ignore
    if (document?.fonts?.ready) {
      // @ts-ignore
      await document.fonts.ready;
    }
  }, selector);
}
