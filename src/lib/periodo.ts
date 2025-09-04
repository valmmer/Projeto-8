// src/lib/periodo.ts
/** garante 2 dígitos */
const two = (n: number | string) => String(n).padStart(2, "0");
const clampMonth = (mm: number) => Math.min(12, Math.max(1, mm));

/**
 * Máscara para "MM/AAAA - MM/AAAA"
 * - Digitar "2020" vira "01/2020 - "
 * - Digitar "032020" vira "03/2020 - "
 * - Depois continue digitando MMYYYY da data final: "032020012021" => "03/2020 - 01/2021"
 */
export function formatPeriodoInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 12); // MMYYYYMMYYYY
  // caso especial: ano sozinho (ex.: "2020")
  if (digits.length === 4 && /^\d{4}$/.test(raw.trim())) {
    return `01/${digits} - `;
  }

  // início
  let mm1 = digits.slice(0, 2);
  let y1 = digits.slice(2, 6);
  // fim
  let mm2 = digits.slice(6, 8);
  let y2 = digits.slice(8, 12);

  let out = "";

  if (mm1) {
    const m = clampMonth(Number(mm1 || "0"));
    out += two(m);
  }
  if (y1) out += `/${y1}`;

  if (digits.length > 6 || raw.includes("-")) out += " - ";

  if (mm2) {
    const m = clampMonth(Number(mm2 || "0"));
    out += two(m);
  }
  if (y2) out += `/${y2}`;

  return out;
}
