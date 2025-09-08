// src/lib/eduPeriod.ts
// Converte vários formatos para uma linha amigável:
// - "2003"                  -> "Concluído em 2003"
// - "Concluído em 2003"     -> "Concluído em 2003"
// - "Término em 2025"       -> "Término em 2025"
// - "03/2018 - 12/2021"     -> "Concluído em 2021"
// - "02/2020 - Atual"       -> "Em andamento"

const RE_Y = /^(\d{4})$/;
const RE_DONE_Y = /^conclu[ií]do\s+em\s+(\d{4})$/i;
const RE_END_Y = /^t[ée]rmino\s+em\s+(\d{4})$/i;
const RE_MMYYYY_RANGE =
  /^(0[1-9]|1[0-2])\/(\d{4})\s*-\s*((0[1-9]|1[0-2])\/(\d{4})|Atual)$/i;

export function formatEduPeriodLine(periodo?: string): string {
  const p = (periodo || '').trim();
  if (!p) return '';

  // 1) "2003"
  const mY = p.match(RE_Y);
  if (mY) return `Concluído em ${mY[1]}`;

  // 2) "Concluído em 2003"
  const mDone = p.match(RE_DONE_Y);
  if (mDone) return `Concluído em ${mDone[1]}`;

  // 3) "Término em 2025"
  const mEnd = p.match(RE_END_Y);
  if (mEnd) return `Término em ${mEnd[1]}`;

  // 4) "MM/AAAA - MM/AAAA" | "MM/AAAA - Atual"
  const mRange = p.match(RE_MMYYYY_RANGE);
  if (mRange) {
    const end = mRange[3];
    if (/^atual$/i.test(end)) return 'Em andamento';
    // pega o ano do fim
    const endYear = end.slice(3);
    return `Concluído em ${endYear}`;
  }

  // fallback: devolve como o usuário digitou
  return p;
}
