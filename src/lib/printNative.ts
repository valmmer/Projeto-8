// src/lib/printNative.ts
// Impressão nativa centralizada com ativação automática da classe "exporting"
// no wrapper da página (ex.: #cv-page). Remove a classe após a impressão
// (com afterprint e um fallback por segurança).

/**
 * Dispara a impressão nativa garantindo que o wrapper (#cv-page)
 * esteja em "estado de exportação" (sem paddings extras).
 *
 * @param selector CSS do contêiner da página A4 (default: "#cv-page")
 */
export async function printNative(selector: string = '#cv-page') {
  const el = document.querySelector(selector) as HTMLElement | null;

  // Ativa o estado de exportação (CSS @media print assume controle total)
  if (el) el.classList.add('exporting');

  // Limpeza garantida (após imprimir — ou se cancelar)
  const cleanup = () => {
    if (el) el.classList.remove('exporting');
    window.removeEventListener('afterprint', cleanup);
  };

  // Navegadores modernos disparam este evento ao terminar/cancelar a impressão
  window.addEventListener('afterprint', cleanup, { once: true });

  // Fallback: se o navegador não disparar afterprint (ou usuário cancelar)
  setTimeout(() => cleanup(), 2000);

  // Dispara a caixa de diálogo de impressão
  window.print();
}
