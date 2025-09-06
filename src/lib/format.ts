// src/lib/format.ts
// -----------------------------------------------------------------------------
// Utilitários de formatação/ordenação para o template ABNT
// -----------------------------------------------------------------------------

/* ============================ Datas / Períodos ============================ */

/** Converte várias formas de data para MM/AAAA. */
function toMmYyyy(s?: string): string {
  if (!s) return '';
  const t = s.trim();
  // YYYY-MM
  let m = t.match(/^(\d{4})-(\d{2})$/);
  if (m) return `${m[2]}/${m[1]}`;
  // MM/YYYY
  m = t.match(/^(\d{2})\/(\d{4})$/);
  if (m) return `${m[1]}/${m[2]}`;
  // YYYY
  m = t.match(/^(\d{4})$/);
  if (m) return `01/${m[1]}`;
  return t;
}

/** Padroniza o período para "MM/AAAA – MM/AAAA" ou "MM/AAAA – atual". */
export function formatPeriod(opts: {
  periodo?: string;
  inicio?: string;
  fim?: string;
  atual?: boolean;
}): string {
  const { periodo, inicio, fim, atual } = opts || {};
  if (periodo && periodo.trim()) {
    // normaliza traço para EN DASH
    return periodo
      .trim()
      .replace(/-+/g, '\u2013')
      .replace(/\s*\u2013\s*/g, ' \u2013 ');
  }
  const ini = toMmYyyy(inicio);
  const end = atual ? 'atual' : toMmYyyy(fim);
  if (ini && end) return `${ini} \u2013 ${end}`;
  if (ini) return ini;
  if (end) return end;
  return '';
}

/** Transforma datas em número comparável YYYYMM. */
function ymFrom(s?: string): number | null {
  if (!s) return null;
  const t = s.trim();
  // MM/YYYY
  let m = t.match(/^(\d{2})\/(\d{4})$/);
  if (m) return parseInt(m[2], 10) * 100 + parseInt(m[1], 10);
  // YYYY-MM
  m = t.match(/^(\d{4})-(\d{2})$/);
  if (m) return parseInt(m[1], 10) * 100 + parseInt(m[2], 10);
  // YYYY
  m = t.match(/^(\d{4})$/);
  if (m) return parseInt(m[1], 10) * 100 + 1;
  return null;
}

function endComparable(p: { fim?: string; atual?: boolean }): number {
  if (p?.atual) return 999912; // "atual" no topo
  const n = ymFrom(p?.fim);
  return n ?? -1;
}
function startComparable(p: { inicio?: string }): number {
  const n = ymFrom(p?.inicio);
  return n ?? -1;
}

/** Ordena cópia do array do mais recente para o mais antigo. */
export function sortByMostRecentPeriod<T>(
  arr: T[],
  get: (x: T) => { inicio?: string; fim?: string; atual?: boolean },
): T[] {
  return [...arr].sort((a, b) => {
    const A = get(a);
    const B = get(b);
    const endDiff = endComparable(B) - endComparable(A);
    if (endDiff !== 0) return endDiff;
    return startComparable(B) - startComparable(A);
  });
}

/* ========================= Descrição → Bullets ========================= */

/**
 * Converte descrição livre em lista de tópicos.
 * Divide por \n, "•" e ";" ; remove vazios; junta linhas muito curtas.
 */
export function splitBullets(text?: string): string[] {
  if (!text) return [];
  const raw = text
    .replace(/\r/g, '')
    .split(/\n+|•+|;+/g)
    .map((s) => s.trim())
    .filter(Boolean);

  const out: string[] = [];
  for (let i = 0; i < raw.length; i++) {
    const cur = raw[i];
    if (cur.length < 8 && i < raw.length - 1) {
      out.push(`${cur} ${raw[i + 1]}`.trim());
      i++; // juntou com o próximo
    } else {
      out.push(cur);
    }
  }
  return out;
}

/* ============================= Idiomas ============================= */

const LANG_RANK: Record<string, number> = {
  C2: 6,
  C1: 5,
  B2: 4,
  B1: 3,
  A2: 2,
  A1: 1,
  Avançado: 5,
  Intermediário: 3,
  Básico: 1,
};

/** Normaliza nível (CEFR A1..C2 ou PT Básico/Intermediário/Avançado). */
function normLevel(s?: string): string {
  if (!s) return '';
  const t = s.trim().toUpperCase();
  const m = t.match(/^[ABC][12]$/); // CEFR?
  if (m) return m[0];
  const pt = s.trim().toLowerCase();
  if (pt.startsWith('av')) return 'Avançado';
  if (pt.startsWith('in')) return 'Intermediário';
  if (pt.startsWith('bá') || pt.startsWith('ba')) return 'Básico';
  return s.trim();
}

/** Score para ordenar nível de idioma (desc). */
export function rankLangLevel(nivel?: string): number {
  const n = normLevel(nivel);
  return LANG_RANK[n] ?? 0;
}

/** Nível normalizado para exibição. */
export function displayLangLevel(nivel?: string): string {
  const n = normLevel(nivel);
  return n || '';
}

/* ========================== Certificações ========================== */

/** Normaliza "ano" (string/number) para AAAA; null se não der. */
export function normalizeYear(y?: string | number): number | null {
  if (y == null) return null;
  const s = String(y).trim();
  const m4 = s.match(/(\d{4})/);
  return m4 ? parseInt(m4[1], 10) : null;
}

/** Ordena por ano desc; em empate, por órgão e depois título. */
export function sortByYearDesc<T>(
  arr: T[],
  get: (x: T) => { ano?: string | number; orgao?: string; titulo?: string },
): T[] {
  return [...arr].sort((a, b) => {
    const A = get(a),
      B = get(b);
    const ay = normalizeYear(A.ano) ?? -1;
    const by = normalizeYear(B.ano) ?? -1;
    if (by !== ay) return by - ay;
    const ao = (A.orgao || '').localeCompare(B.orgao || '', 'pt', {
      sensitivity: 'base',
    });
    if (ao !== 0) return ao;
    return (A.titulo || '').localeCompare(B.titulo || '', 'pt', {
      sensitivity: 'base',
    });
  });
}

/* ============================ Habilidades ============================ */

/**
 * Separa e ordena habilidades:
 * - Hard: por nível (Avançado > Intermediário > Básico) e nome
 * - Soft: por nome (A→Z)
 */
export function sortSkills<
  T extends { tipo?: string; nivel?: string; nome: string },
>(items: T[]): { hard: T[]; soft: T[] } {
  const LVL: Record<string, number> = {
    Avançado: 3,
    Intermediário: 2,
    Básico: 1,
  };

  const hard = items
    .filter((s) => s.tipo !== 'Soft')
    .sort((a, b) => {
      const la = LVL[a.nivel || ''] ?? 0;
      const lb = LVL[b.nivel || ''] ?? 0;
      if (lb !== la) return lb - la;
      return a.nome.localeCompare(b.nome, 'pt', { sensitivity: 'base' });
    });

  const soft = items
    .filter((s) => s.tipo === 'Soft')
    .sort((a, b) =>
      a.nome.localeCompare(b.nome, 'pt', { sensitivity: 'base' }),
    );

  return { hard, soft };
}
