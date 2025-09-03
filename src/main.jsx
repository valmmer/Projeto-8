// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

/**
 * Guard global em FASE DE CAPTURA:
 * - Se a tecla for Space e o alvo for um campo editável (input/textarea/contentEditable),
 *   bloqueia a propagação para que hotkeys globais não capturem o evento.
 * - NÃO usa preventDefault para deixar o browser inserir o espaço normalmente.
 */
(function attachSpaceGuard() {
  const isEditable = (t: EventTarget | null) => {
    if (!(t instanceof HTMLElement)) return false;
    const tag = t.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || t.isContentEditable) return true;
    // inputs contentEditable customizados
    if (tag === "DIV" && t.isContentEditable) return true;
    return false;
  };

  const onKey = (e: KeyboardEvent) => {
    if ((e.key === " " || e.code === "Space") && isEditable(e.target)) {
      // deixa o espaço entrar (sem preventDefault),
      // apenas impede que atalhos globais peguem o evento
      e.stopPropagation();
      (e as any).stopImmediatePropagation?.();
    }
  };

  const onBeforeInput = (e: Event) => {
    const ie = e as any;
    if (ie?.inputType === "insertText" && ie?.data === " " && isEditable(e.target)) {
      e.stopPropagation();
      (e as any).stopImmediatePropagation?.();
    }
  };

  // capture: true -> intercepta antes de qualquer outro listener
  window.addEventListener("keydown", onKey, { capture: true });
  window.addEventListener("keypress", onKey, { capture: true });
  window.addEventListener("beforeinput", onBeforeInput as any, { capture: true });
})();

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Elemento #root não encontrado");
}
