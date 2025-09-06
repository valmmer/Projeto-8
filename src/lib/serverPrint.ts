// src/lib/serverPrint.ts

const PRINT_API = (import.meta as any)?.env?.VITE_PRINT_API || '/api/print/pdf';

/** Copia todos os <link rel="stylesheet"> e <style> já carregados na página. */
function collectStylesFromDocument(): string {
  const links = Array.from(
    document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'),
  )
    .map((l) => `<link rel="stylesheet" href="${l.href}">`)
    .join('\n');

  const styles = Array.from(
    document.querySelectorAll<HTMLStyleElement>('style'),
  )
    .map((s) => `<style>${s.textContent ?? ''}</style>`)
    .join('\n');

  return `${links}\n${styles}`;
}

/** Envolve o HTML do #cv-page com <html><head>… e injeta CSS atual da app. */
function wrapHtml(inner: string) {
  // base para resolver assets (funciona em dev e build com BASE_URL)
  const base =
    `${location.origin}` +
    ((import.meta as any)?.env?.BASE_URL ?? '/').replace(/\/?$/, '/');

  const headCss =
    collectStylesFromDocument() ||
    // fallback (dev): o index.css importa o print.css internamente
    `<link rel="stylesheet" href="/src/index.css">`;

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<base href="${base}">
${headCss}
<style>
  /* Foco total no #cv-page quando essa página isolada for aberta */
  @media print {
    body { background:#fff !important; }
  }
</style>
</head>
<body>
${inner}
</body>
</html>`;
}

/**
 * Gera PDF no servidor.
 * - Por padrão, se encontrar o elemento no DOM, envia só o HTML dele + CSS atuais.
 * - Para máxima fidelidade, você pode forçar URL (opts.forceUrl = true), que carrega
 *   a página inteira no Puppeteer e aplica @media print; nesse caso garanta que seu
 *   CSS oculte todo o resto na impressão (ver nota abaixo).
 */
export async function downloadServerPDF(
  fromUrl?: string,
  opts?: { fileName?: string; selector?: string; forceUrl?: boolean },
) {
  const sel = opts?.selector ?? '#cv-page';
  const el = document.querySelector(sel) as HTMLElement | null;

  // Use URL se for explicitamente solicitado OU se não achar o seletor
  const shouldUseUrl = !!opts?.forceUrl || !el;

  const body = shouldUseUrl
    ? { url: fromUrl ?? location.href, fileName: opts?.fileName }
    : { html: wrapHtml(el!.outerHTML), fileName: opts?.fileName };

  const res = await fetch(PRINT_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error('Falha ao gerar PDF no servidor');

  const blob = await res.blob();
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = `${(opts?.fileName || document.title || 'curriculo').replace(
    /\.pdf$/i,
    '',
  )}.pdf`;
  a.click();
  URL.revokeObjectURL(href);
}
