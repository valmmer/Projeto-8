// src/lib/validators.ts
// ------------------------------------------------------------
// Utilitários de validação e formatação (sem libs externas).
// • Compatível com as funções existentes (isNonEmpty, minLength, etc.)
// • Acrescenta normalizações para Cidade – Estado, e-mail, telefone e URLs
// • Inclui verificação de faixa etária para data de nascimento
// ------------------------------------------------------------

// --------------------------- Básicos ---------------------------
export function isNonEmpty(s?: string | null): boolean {
  return !!(s && s.trim().length > 0);
}

export function minLength(s: string | undefined, n: number): boolean {
  return !!s && s.trim().length >= n;
}

export function isValidISODate(s?: string): boolean {
  if (!s) return false;
  // aceita "YYYY-MM-DD"
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return false;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  const dt = new Date(Date.UTC(y, mo, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === mo &&
    dt.getUTCDate() === d
  );
}

/** Calcula idade (anos completos) a partir de "YYYY-MM-DD". */
export function calcIdade(dateISO?: string): number | null {
  if (!isValidISODate(dateISO)) return null;
  const [y, m, d] = (dateISO as string).split('-').map(Number);
  const hoje = new Date();
  let idade = hoje.getFullYear() - y;
  const mDiff = hoje.getMonth() + 1 - m;
  const dDiff = hoje.getDate() - d;
  if (mDiff < 0 || (mDiff === 0 && dDiff < 0)) idade--;
  return idade;
}

/** Valida se a data é ISO válida e se a idade está entre minAge e maxAge (inclusive). */
export function isValidBirthDateInRange(
  dateISO?: string,
  minAge = 15,
  maxAge = 70,
): boolean {
  const idade = calcIdade(dateISO);
  return typeof idade === 'number' && idade >= minAge && idade <= maxAge;
}

// ----------------------- Resumo profissional -------------------
export type FieldError = { field: string; message: string };

/** Mantém compat: retorna uma lista de erros (0..n) para o campo "resumo". */
export function validateResumo(
  resumo: string | undefined,
  min = 180,
  max = 600,
): FieldError[] {
  const errors: FieldError[] = [];
  if (!isNonEmpty(resumo)) {
    errors.push({ field: 'resumo', message: 'O resumo é obrigatório.' });
  } else {
    const len = (resumo as string).trim().length;
    if (len < min)
      errors.push({
        field: 'resumo',
        message: `O resumo precisa de pelo menos ${min} caracteres (atual: ${len}).`,
      });
    if (len > max)
      errors.push({
        field: 'resumo',
        message: `O resumo deve ter no máximo ${max} caracteres (atual: ${len}).`,
      });
  }
  return errors;
}

/** Versão prática: devolve uma string de erro (ou undefined) para "resumo". */
export function resumoError(
  resumo: string | undefined,
  min = 180,
  max = 600,
): string | undefined {
  const errs = validateResumo(resumo, min, max);
  return errs[0]?.message;
}

// ----------------------- E-mail & Telefone ---------------------
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

export function validateEmail(email?: string): boolean {
  if (!email) return false;
  return EMAIL_RE.test(email.trim());
}

/** Normaliza e-mail para minúsculas + trim. */
export function normalizeEmail(email: string): string {
  return (email || '').trim().toLowerCase();
}

/** Devolve uma mensagem de erro para e-mail (ou undefined se ok). */
export function emailError(email?: string): string | undefined {
  if (!isNonEmpty(email)) return 'Informe um e-mail.';
  if (!validateEmail(email)) return 'E-mail inválido.';
  return undefined;
}

/**
 * Validação permissiva de telefone:
 * - permite dígitos, espaços, parênteses, hífen e um '+' inicial
 * - exige no mínimo 6 dígitos
 */
export function validatePhone(phone?: string): boolean {
  if (!phone) return false;
  const trimmed = phone.trim();
  const plusOk = !/[+]/.test(trimmed.slice(1)); // '+' apenas na 1ª posição
  const digits = trimmed.replace(/\D/g, '');
  return plusOk && digits.length >= 6;
}

/** Normaliza telefone (mantém + no início) e aplica espaçamento leve. */
export function normalizePhone(raw: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/[^\d]/g, '');
  let out = hasPlus ? '+' + digits : digits;

  // formatação heurística
  if (out.startsWith('+')) {
    // +CC [AA] [XXXX] [YYYY]
    out = out.replace(
      /^\+(\d{1,3})(\d{2,4})?(\d{3,4})?(\d{3,4})?(\d+)?$/,
      (_m, c, a = '', b = '', d = '', e = '') =>
        ['+' + c, a, b, d, e].filter(Boolean).join(' '),
    );
  } else {
    // AA XXXX YYYY (sem DDI)
    out = out.replace(
      /^(\d{2})(\d{4})?(\d{4})?(\d+)?$/,
      (_m, a, b = '', c = '', d = '') => [a, b, c, d].filter(Boolean).join(' '),
    );
  }
  return out.trim();
}

/** Devolve mensagem de erro para telefone (ou undefined). */
export function phoneError(phone?: string): string | undefined {
  if (!isNonEmpty(phone)) return 'Informe um telefone.';
  if (!validatePhone(phone)) return 'Telefone inválido.';
  return undefined;
}

// ---------------------- Cidade – Estado ------------------------
/** Normaliza para "Cidade - Estado" (um traço com espaços dos dois lados). */
export function normalizeCityState(s: string): string {
  if (!s) return '';
  let t = s.trim();
  // converte travessões e separadores comuns em "-"
  t = t.replace(/[–—]/g, '-').replace(/[,\|/]+/g, '-');
  // padroniza espaços ao redor do traço
  t = t.replace(/\s*-\s*/g, ' - ');
  // colapsa espaços múltiplos
  t = t.replace(/\s{2,}/g, ' ').trim();
  return t;
}

/** Auto-insere " - " enquanto digita (quando usuário coloca separador no fim). */
export function autoHyphenWhileTyping(s: string): string {
  if (!s) return s;
  // se terminar com separador, vira " - "
  let t = s.replace(/\s*[-,–—/|]\s*$/u, ' - ');
  // se terminar com 2+ espaços, assume que quis o traço
  t = t.replace(/\s{2,}$/, ' - ');
  // padroniza espaços ao redor de qualquer traço que tenha surgido
  t = t.replace(/\s*-\s*/g, ' - ');
  return t;
}

/** Mensagem de erro amigável para "Cidade - Estado". */
export function cityStateError(v?: string): string | undefined {
  if (!isNonEmpty(v)) return 'Informe cidade e estado (ex.: "São Paulo - SP").';
  const t = normalizeCityState(v as string);
  if (!t.includes('-')) {
    return 'Use o formato "Cidade - Estado".';
  }
  const [cidade, estado] = t.split('-').map((x) => x.trim());
  if (!cidade || !estado) {
    return 'Complete "Cidade - Estado".';
  }
  // opcional: exigir min. 2 caracteres no estado
  if (estado.length < 2) {
    return 'Informe a sigla ou nome do estado (ex.: "SP").';
  }
  return undefined;
}

// -------------------------- URLs úteis -------------------------
export function ensureHttp(url: string): string {
  if (!url) return '';
  const u = url.trim();
  if (/^https?:\/\//i.test(u)) return u;
  return 'https://' + u.replace(/^\/+/, '');
}

export function normalizeLinkedIn(url: string): string {
  if (!url) return '';
  let u = ensureHttp(url);
  // força domínio linkedin.com (sem quebrar subpaths)
  u = u.replace(
    /https?:\/\/(www\.)?linkedin\.[^/]+/i,
    'https://www.linkedin.com',
  );
  return u;
}

export function normalizeGitHub(url: string): string {
  if (!url) return '';
  let u = ensureHttp(url);
  u = u.replace(/https?:\/\/(www\.)?github\.[^/]+/i, 'https://github.com');
  return u;
}

// ----------------- Data de nascimento (erro único) --------------
/** Devolve mensagem de erro para data de nascimento (ou undefined). */
export function birthDateError(
  dateISO?: string,
  minAge = 15,
  maxAge = 70,
): string | undefined {
  if (!isValidISODate(dateISO)) return 'Use o formato YYYY-MM-DD.';
  if (!isValidBirthDateInRange(dateISO, minAge, maxAge)) {
    return `A idade deve estar entre ${minAge} e ${maxAge} anos.`;
  }
  return undefined;
}

// ----------------- Educação: validação de "período" -----------------

// Antigo: "MM/AAAA - MM/AAAA" | "MM/AAAA - Atual"
export const RE_EDU_PERIOD_LEGACY =
  /^(0[1-9]|1[0-2])\/(\d{4})\s-\s((0[1-9]|1[0-2])\/(\d{4})|Atual)$/;

// Apenas ano
export const RE_EDU_YEAR = /^(19|20)\d{2}$/;

// Textos com ano: "Concluído em YYYY" | "Término em YYYY"
export const RE_EDU_YEAR_STATUS =
  /^(Conclu[ií]do em|T[ée]rmino em)\s(19|20)\d{2}$/i;

/** Mensagem de ajuda/erro unificada para o campo período de formação. */
export const EDU_PERIOD_HELP =
  'Use "MM/AAAA - MM/AAAA", "MM/AAAA - Atual", "YYYY", "Concluído em YYYY" ou "Término em YYYY".';

/** Aceita os formatos acima para o período acadêmico. */
export function isValidEducationPeriod(s?: string): boolean {
  const v = (s || '').trim();
  return (
    RE_EDU_PERIOD_LEGACY.test(v) ||
    RE_EDU_YEAR.test(v) ||
    RE_EDU_YEAR_STATUS.test(v)
  );
}
