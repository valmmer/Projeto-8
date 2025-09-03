// personal.ts
import type { PersonalData, ResumeState, Education } from "../types";

// ===== Helpers (sem libs) =====
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const urlRegex = /^https?:\/\/[\w.-]+(?:\.[\w.-]+)+(?:[^\s]*)$/i;
const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
const phoneAllowedChars = /^[0-9()+\-\s]+$/; // caracteres permitidos
const onlyDigits = (s: string) => (s.match(/\d/g) ?? []).join("");
const norm = (s: string) => s.normalize("NFC").trim();

// Domínios específicos (melhor UX)
const isLinkedin = (u: string) => /(^|\.)linkedin\.com\/?/i.test(u);
const isGithub = (u: string) => /(^|\.)github\.com\/?/i.test(u);

// ===== Tipos =====
export type PersonalErrors = Partial<Record<keyof PersonalData, string>>;

export type ValidatePersonalOpts = {
  maxResumo?: number;        // default 600
  maxObjetivo?: number;      // default 160
  minAge?: number;           // default 14 (anos)
  requireResumo?: boolean;   // default true
  requireObjetivo?: boolean; // default false
};

// ---------- Formação Acadêmica ----------
export type EducationItemErrors = {
  curso?: string;
  instituicao?: string;
  periodo?: string;
};

export type EducationErrors = {
  byId: Record<string, EducationItemErrors>;
  list?: string; // erro de nível de lista (ex.: "adicione ao menos 1 formação")
};

export type ValidateEducationOpts = {
  requireAtLeastOne?: boolean; // default true
  allowSingleYear?: boolean;   // default false (aceitar "2017" isolado)
};

// ===== Validação Pessoal =====
export function validatePersonal(
  dados: PersonalData,
  opts?: ValidatePersonalOpts
): PersonalErrors {
  const {
    maxResumo = 600,
    maxObjetivo = 160,
    minAge = 14,
    requireResumo = true,
    requireObjetivo = false,
  } = opts ?? {};

  const errors: PersonalErrors = {};

  // -------- Obrigatórios básicos --------
  if (!dados.nome?.trim()) errors.nome = "Informe seu nome completo.";
  if (!dados.email?.trim()) errors.email = "Informe um email.";
  if (!dados.telefone?.trim()) errors.telefone = "Informe um telefone.";

  if (requireResumo && !dados.resumo?.trim()) {
    errors.resumo = "Escreva um breve resumo.";
  }
  if (requireObjetivo && !dados.objetivo?.trim()) {
    errors.objetivo = "Informe seu objetivo profissional.";
  }

  // -------- Formatos --------
  // Nome
  if (dados.nome?.trim()) {
    const len = dados.nome.trim().length;
    if (len < 3) errors.nome = "Nome muito curto.";
    if (len > 120) errors.nome = "Nome muito longo.";
  }

  // Email
  if (dados.email && !emailRegex.test(dados.email)) {
    errors.email = "Email inválido.";
  }

  // Telefone
  if (dados.telefone) {
    const tel = dados.telefone.trim();
    if (!phoneAllowedChars.test(tel)) {
      errors.telefone = "Telefone contém caracteres inválidos.";
    } else {
      const digits = onlyDigits(tel);
      if (digits.length < 8 || digits.length > 15) {
        errors.telefone = "Telefone deve ter entre 8 e 15 dígitos.";
      }
    }
  }

  // LinkedIn
  if (dados.linkedin) {
    const u = dados.linkedin.trim();
    if (!urlRegex.test(u)) {
      errors.linkedin = "URL inválida (use https://...).";
    } else if (!isLinkedin(u)) {
      errors.linkedin = "Use uma URL do LinkedIn (linkedin.com/...).";
    }
  }

  // GitHub
  if (dados.github && dados.github.trim()) {
    const u = dados.github.trim();
    if (!urlRegex.test(u)) {
      errors.github = "URL inválida (use https://...).";
    } else if (!isGithub(u)) {
      errors.github = "Use uma URL do GitHub (github.com/...).";
    }
  }

  // Site / Portfólio
  if (dados.site && dados.site.trim() && !urlRegex.test(dados.site.trim())) {
    errors.site = "URL inválida (use https://...).";
  }

  // Resumo
  if (typeof dados.resumo === "string" && dados.resumo.length > maxResumo) {
    errors.resumo = `Máx. ${maxResumo} caracteres.`;
  }

  // Objetivo
  if (typeof dados.objetivo === "string" && dados.objetivo.length > maxObjetivo) {
    errors.objetivo = `Máx. ${maxObjetivo} caracteres.`;
  }

  // Cidade/País (opcional)
  if (dados.cidadePais && dados.cidadePais.length > 80) {
    errors.cidadePais = "Máx. 80 caracteres.";
  }

  // Data de nascimento (opcional): ISO + range + idade mínima
  if (dados.dataNascimento) {
    if (!isoDateRegex.test(dados.dataNascimento)) {
      errors.dataNascimento = "Use formato yyyy-mm-dd.";
    } else {
      const d = new Date(dados.dataNascimento);
      const min = new Date("1900-01-01");
      const hoje = new Date();
      if (isNaN(d.getTime()) || d < min || d > hoje) {
        errors.dataNascimento = "Data inválida.";
      } else {
        const idade = diffYears(d, hoje);
        if (idade < minAge) {
          errors.dataNascimento = `Idade mínima: ${minAge} anos.`;
        }
      }
    }
  }

  return errors;
}

// ===== Helpers de data =====
function diffYears(a: Date, b: Date) {
  let years = b.getFullYear() - a.getFullYear();
  const m = b.getMonth() - a.getMonth();
  if (m < 0 || (m === 0 && b.getDate() < a.getDate())) years--;
  return years;
}

// ====== Formação Acadêmica ======

// Normaliza separadores e capitaliza "Atual"
function normalizePeriodo(p: string) {
  let s = norm(p);
  // unificar travessão: -, – ou —
  s = s.replace(/[–—]/g, "-");
  // Padroniza "Atual"
  s = s.replace(/\batual\b/gi, "Atual");
  return s;
}

/**
 * Aceita formatos:
 *  - YYYY - YYYY
 *  - YYYY - Atual
 *  - MM/YYYY - MM/YYYY
 *  - MM/YYYY - Atual
 * (com ou sem espaços ao redor do "-")
 * Se allowSingleYear, aceita também: YYYY
 */
function parsePeriodo(
  periodoRaw: string,
  opts?: { allowSingleYear?: boolean }
): { ok: boolean; start?: number; end?: number; openEnded?: boolean } {
  const allowSingleYear = !!opts?.allowSingleYear;
  const p = normalizePeriodo(periodoRaw);

  const yearRange = /^\s*(\d{4})\s*-\s*(\d{4}|Atual)\s*$/i;
  const monthYearRange = /^\s*(\d{2})\/(\d{4})\s*-\s*(?:(\d{2})\/(\d{4})|Atual)\s*$/i;
  const singleYear = /^\s*(\d{4})\s*$/;

  // YYYY - YYYY | YYYY - Atual
  let m = p.match(yearRange);
  if (m) {
    const y1 = Number(m[1]);
    const y2 = m[2].toLowerCase?.() === "atual" ? null : Number(m[2]);
    const start = y1 * 100 + 1; // mês fictício 01
    const end = y2 ? y2 * 100 + 12 : undefined;
    return { ok: true, start, end, openEnded: y2 == null };
  }

  // MM/YYYY - MM/YYYY | MM/YYYY - Atual
  m = p.match(monthYearRange);
  if (m) {
    const mm1 = Number(m[1]),
      y1 = Number(m[2]);
    const mm2 = m[3] ? Number(m[3]) : undefined;
    const y2 = m[4] ? Number(m[4]) : undefined;
    if (mm1 < 1 || mm1 > 12) return { ok: false };
    if (mm2 && (mm2 < 1 || mm2 > 12)) return { ok: false };
    const start = y1 * 100 + mm1;
    const end = y2 && mm2 ? y2 * 100 + mm2 : undefined;
    return { ok: true, start, end, openEnded: !end };
  }

  // YYYY (opcional)
  if (allowSingleYear && singleYear.test(p)) {
    const y = Number(p.match(singleYear)![1]);
    return { ok: true, start: y * 100 + 1, end: y * 100 + 12, openEnded: false };
  }

  return { ok: false };
}

export function validateEducationItem(
  e: Education,
  opts?: ValidateEducationOpts
): EducationItemErrors {
  const { allowSingleYear = false } = opts ?? {};
  const errs: EducationItemErrors = {};

  // Curso/Instituição obrigatórios
  if (!e.curso?.trim()) errs.curso = "Informe o curso.";
  if (!e.instituicao?.trim()) errs.instituicao = "Informe a instituição.";

  // Período obrigatório + formato
  if (!e.periodo?.trim()) {
    errs.periodo = "Informe o período (ex.: 2016 - 2017 ou 01/2016 - 12/2017).";
  } else {
    const parsed = parsePeriodo(e.periodo, { allowSingleYear });
    if (!parsed.ok) {
      errs.periodo = "Período inválido. Use YYYY - YYYY ou MM/YYYY - MM/YYYY.";
    } else if (parsed.end && parsed.start! > parsed.end) {
      errs.periodo = "Período inicial deve ser anterior ao final.";
    }
  }

  return errs;
}

export function validateEducations(
  list: Education[],
  opts?: ValidateEducationOpts
): EducationErrors {
  const { requireAtLeastOne = true } = opts ?? {};
  const byId: Record<string, EducationItemErrors> = {};

  if (requireAtLeastOne && (!list || list.length === 0)) {
    return { byId, list: "Adicione ao menos uma formação." };
  }

  for (const e of list ?? []) {
    byId[e.id] = validateEducationItem(e, opts);
  }

  return { byId };
}

// ===== Conveniências =====
export function isPersonalValid(
  dados: PersonalData,
  opts?: ValidatePersonalOpts
) {
  return Object.keys(validatePersonal(dados, opts)).length === 0;
}

export function firstPersonalError(
  dados: PersonalData,
  opts?: ValidatePersonalOpts
): string | null {
  const e = validatePersonal(dados, opts);
  const key = Object.keys(e)[0] as keyof PersonalData | undefined;
  return key ? e[key]! : null;
}

// valida o passo de Dados Pessoais
export function canProceedPersonal(
  state: ResumeState,
  opts?: ValidatePersonalOpts
) {
  return isPersonalValid(state.dados, opts);
}

// ✅ valida o passo "Objetivo & Formação"
export function canProceedObjectiveAndEducation(
  state: ResumeState,
  personalOpts?: ValidatePersonalOpts,
  eduOpts?: ValidateEducationOpts
) {
  // objetivo obrigatório neste passo
  const pOk = isPersonalValid(state.dados, {
    ...personalOpts,
    requireResumo: false,      // resumo já foi exigido no passo 0
    requireObjetivo: true,     // objetivo obrigatório aqui
    maxObjetivo: personalOpts?.maxObjetivo ?? 160,
  });

  const edu = validateEducations(state.formacoes ?? [], {
    requireAtLeastOne: true,
    ...eduOpts,
  });

  const hasEduErrors =
    !!edu.list ||
    Object.values(edu.byId).some(
      (it) => it.curso || it.instituicao || it.periodo
    );

  return pOk && !hasEduErrors;
}
