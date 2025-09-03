// src/inputShield.ts
// Escudo de entrada: garante digitação normal (incluindo espaço) em campos editáveis,
// mesmo quando existem hotkeys globais registradas em captura.

function isEditable(el: EventTarget | null): el is HTMLElement {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return true;
  if (el.isContentEditable) return true;
  // alguns componentes usam role="textbox"
  if (el.getAttribute('role') === 'textbox') return true;
  return false;
}

// Evita que atalhos globais em captura vejam o evento quando estamos digitando em um campo
function shieldKeyEvent(e: KeyboardEvent) {
  if (!isEditable(e.target)) return;

  // Se está digitando texto (sem modificadores), deixe o browser inserir normalmente
  if (!e.ctrlKey && !e.metaKey && !e.altKey) {
    // Não chame preventDefault() para não bloquear a digitação;
    // só impedimos que hotkeys globais vejam o evento.
    e.stopPropagation();
    (e as any).stopImmediatePropagation?.();
  }
}

// BeforeInput também pode ser usado por libs modernas — aplique o mesmo bloqueio.
function shieldBeforeInput(e: InputEvent) {
  if (!isEditable(e.target)) return;
  e.stopPropagation();
  (e as any).stopImmediatePropagation?.();
}

// Registre cedo, em CAPTURA, para ficar à frente de hotkeys globais:
window.addEventListener('keydown', shieldKeyEvent, { capture: true });
window.addEventListener('keypress', shieldKeyEvent, { capture: true });
window.addEventListener('beforeinput', shieldBeforeInput as EventListener, {
  capture: true,
});

// (Opcional) Se quiser depurar, descomente:
// window.addEventListener("keydown", (e) => {
//   if (isEditable(e.target)) console.log("[shield] keydown", e.key);
// }, { capture: true });
