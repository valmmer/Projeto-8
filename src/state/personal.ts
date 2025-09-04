// src/state/personal.ts
// -----------------------------------------------------------
// Validações dos dados pessoais e formação acadêmica
// - Campos obrigatórios + formatos (email, telefone, URLs)
// - Nascimento: faixa permitida (15–70 anos) + ISO yyyy-mm-dd
// - Formação: período APENAS no formato "MM/AAAA - MM/AAAA" ou "MM/AAAA - Atual"
//   (opcional: aceitar "YYYY" isolado quando allowSingleYear === true)
// - Conveniências: isPersonalValid, firstPersonalError e validadores por passo
// -----------------------------------------------------------

import type { PersonalData, ResumeState, Education } from '../types';

// ===== Helpers (sem libs externas) =====
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const urlRegex = /^https?:\/\/[\w.-]+(?:\.[\w.-]+)+(?:[^\s]*)$/i;
const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
const phoneAllowedChars = /^[0-9()+\-\s]+$/; // caracteres permitidos no telefone
const onlyDigits = (s: string) => (s.match(/\d/g) ?? []).join('');
const norm = (s: string) => s.normalize('NFC').trim();

// Domínios específicos (melhor UX nas mensagens)
const isLinkedin = (u: string) => /(^|\.)linkedin\.com\/?/i.test(u);
const isGithub = (u: string) => /(^|\.)github\.com\/?/i.test(u);

// ===== Tipos =====
export type PersonalErrors = Partial<Record<keyof PersonalData, string>>;

export type ValidatePersonalOpts = {
  maxResumo?: number;               // default 600
  minResumo?: number;               // default 180  ← adicionamos esta opção
  maxObjetivo?: number;             // default 160
  minAge?: number;                  // default 15 (anos)
  maxAge?: number;                  // default 70 (anos)
  requireResumo?: boolean;          // default true
  requireObjetivo?: boolean;        // default false
  requireCidadePais?: boolean;      // default true
  requireDataNascimento?: boolean;  // default true
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

// ===========================================================
// ================  VALIDACÃO DE PESSOAL  ===================
// ===========================================================
export function validatePersonal(
  dados: PersonalData,
  opts?: ValidatePersonalOpts,
): PersonalErrors {
  const {
    maxResumo = 600,
    minResumo = 180, // ✅ mínimo solicitado
    maxObjetivo = 160,
    minAge = 15,
    maxAge = 70,
    requireResumo = true,
    requireObjetivo = false,
    requireCidadePais = true,
    requireDataNascimento = true,
  } = opts ?? {};

  const errors: PersonalErrors = {};

  // -------- Obrigatórios básicos --------
  if (!dados.nome?.trim()) errors.nome = 'Informe seu nome completo.';
  if (!dados.email?.trim()) errors.email = 'Informe um email.';
  if (!dados.telefone?.trim()) errors.telefone = 'Informe um telefone.';

  if (requireResumo && !dados.resumo?.trim()) {
    errors.resumo = `Escreva um resumo (mín. ${minResumo}, máx. ${maxResumo} caracteres).`;
  }
  if (requireObjetivo && !dados.objetivo?.trim()) {
    errors.objetivo = 'Informe seu objetivo profissional.';
  }
  if (requireCidadePais && !dados.cidadePais?.trim()) {
    errors.cidadePais = 'Informe sua cidade e país.';
  }

  // -------- Formatos / limites --------
  // Nome
  if (dados.nome?.trim()) {
    const len = dados.nome.trim().length;
    if (len < 3) errors.nome = 'Nome muito curto.';
    if (len > 120) errors.nome = 'Nome muito longo.';
  }

  // Email
  if (dados.email && !emailRegex.test(dados.email)) {
    errors.email = 'Email inválido.';
  }

  // Telefone (somente dígitos e alguns símbolos, 8–15 dígitos)
  if (dados.telefone) {
    const tel = dados.telefone.trim();
    if (!phoneAllowedChars.test(tel)) {
      errors.telefone = 'Telefone contém caracteres inválidos.';
    } else {
      const digits = onlyDigits(tel);
      if (digits.length < 8 || digits.length > 15) {
        errors.telefone = 'Telefone deve ter entre 8 e 15 dígitos.';
      }
    }
  }

  // LinkedIn
  if (dados.linkedin) {
    const u = dados.linkedin.trim();
    if (!urlRegex.test(u)) {
      errors.linkedin = 'URL inválida (use https://...).';
    } else if (!isLinkedin(u)) {
      errors.linkedin = 'Use uma URL do LinkedIn (linkedin.com/...).';
    }
  }

  // GitHub
  if (dados.github && dados.github.trim()) {
    const u = dados.github.trim();
    if (!urlRegex.test(u)) {
      errors.github = 'URL inválida (use https://...).';
    } else if (!isGithub(u)) {
      errors.github = 'Use uma URL do GitHub (github.com/...).';
    }
  }

  // Site / Portfólio
  if (dados.site && dados.site.trim() && !urlRegex.test(dados.site.trim())) {
    errors.site = 'URL inválida (use https://...).';
  }

  // Resumo (tamanho mínimo/máximo)
  if (typeof dados.resumo === 'string') {
    const trimmed = dados.resumo.trim();
    if (trimmed && trimmed.length < minResumo) {
      errors.resumo = `Resumo muito curto (mín. ${minResumo} caracteres).`;
    } else if (trimmed.length > maxResumo) {
      errors.resumo = `Resumo muito longo (máx. ${maxResumo} caracteres).`;
    }
  }

  // Objetivo (tamanho máximo)
  if (typeof dados.objetivo === 'string' && dados.objetivo.length > maxObjetivo) {
    errors.objetivo = `Máx. ${maxObjetivo} caracteres.`;
  }

  // Cidade/País (limite de tamanho — se preenchido)
  if (dados.cidadePais && dados.cidadePais.trim()) {
    const len = dados.cidadePais.trim().length;
    if (len < 3) errors.cidadePais = 'Muito curto.';
    else if (len > 80) errors.cidadePais = 'Máx. 80 caracteres.';
  }

  // Data de nascimento: obrigatória + ISO yyyy-mm-dd + faixa 15–70 anos
  const hoje = new Date();
  if (!dados.dataNascimento?.trim()) {
    if (requireDataNascimento) errors.dataNascimento = 'Informe sua data de nascimento.';
  } else if (!isoDateRegex.test(dados.dataNascimento)) {
    errors.dataNascimento = 'Use formato yyyy-mm-dd.';
  } else {
    // Fixa meia-noite local para evitar shifting por timezone
    const d = new Date(dados.dataNascimento + 'T00:00:00');
    if (isNaN(d.getTime())) {
      errors.dataNascimento = 'Data inválida.';
    } else {
      // nascimento mais recente permitido (deve ter pelo menos minAge anos)
      const maxBirth = new Date(hoje);
      maxBirth.setFullYear(hoje.getFullYear() - minAge);
      // nascimento mais antigo permitido (no máx. maxAge anos)
      const minBirth = new Date(hoje);
      minBirth.setFullYear(hoje.getFullYear() - maxAge);

      if (d < minBirth || d > maxBirth) {
        const fmt = (dt: Date) => dt.toLocaleDateString('pt-BR');
        errors.dataNascimento = `A data deve estar entre ${fmt(minBirth)} e ${fmt(maxBirth)} (idade entre ${maxAge} e ${minAge} anos).`;
      }
    }
  }

  return errors;
}

// ===== Helpers de data (se precisar no futuro) =====
function diffYears(a: Date, b: Date) {
  let years = b.getFullYear() - a.getFullYear();
  const m = b.getMonth() - a.getMonth();
  if (m < 0 || (m === 0 && b.getDate() < a.getDate())) years--;
  return years;
}

// ===========================================================
// ============  VALIDACÃO DE FORMAÇÃO (Edu)  ================
// ===========================================================

/**
 * Normaliza o texto do período:
 * - unifica travessão (–, —) para "-"
 * - capitaliza "Atual"
 */
function normalizePeriodo(p: string) {
  let s = norm(p);
  s = s.replace(/[–—]/g, '-');
  s = s.replace(/\batual\b/gi, 'Atual');
  return s;
}

/**
 * ✅ Parse de período SOMENTE no formato:
 *   - MM/AAAA - MM/AAAA
 *   - MM/AAAA - Atual
 *   (Opcional) Se opts.allowSingleYear === true, aceita também "YYYY" isolado.
 *
 * Retorna valores numéricos para comparação (YYYYMM):
 *  - start: y1*100 + mm1
 *  - end: y2*100 + mm2 (quando houver)
 */
function parsePeriodo(
  periodoRaw: string,
  opts?: { allowSingleYear?: boolean },
): { ok: boolean; start?: number; end?: number; openEnded?: boolean } {
  const allowSingleYear = !!opts?.allowSingleYear;
  const p = normalizePeriodo(periodoRaw);

  // MM/AAAA - MM/AAAA | MM/AAAA - Atual
  const monthYearRange = /^\s*(\d{2})\/(\d{4})\s*-\s*(?:(\d{2})\/(\d{4})|Atual)\s*$/i;
  // Opcional: "YYYY" isolado (para migração/legado)
  const singleYear = /^\s*(\d{4})\s*$/;

  const m = p.match(monthYearRange);
  if (m) {
    const mm1 = Number(m[1]);
    const y1 = Number(m[2]);
    const mm2 = m[3] ? Number(m[3]) : undefined;
    const y2 = m[4] ? Number(m[4]) : undefined;

    // meses 01–12
    if (mm1 < 1 || mm1 > 12) return { ok: false };
    if (mm2 && (mm2 < 1 || mm2 > 12)) return { ok: false };

    const start = y1 * 100 + mm1;
    const end = y2 && mm2 ? y2 * 100 + mm2 : undefined;

    return { ok: true, start, end, openEnded: !end };
  }

  // ⚠️ Não aceitamos mais "YYYY - YYYY".
  // Aceita "YYYY" isolado somente se explicitamente permitido:
  if (allowSingleYear && singleYear.test(p)) {
    const y = Number(p.match(singleYear)![1]);
    return { ok: true, start: y * 100 + 1, end: y * 100 + 12, openEnded: false };
  }

  return { ok: false };
}

/**
 * Valida um item de Formação:
 * - Curso e Instituição obrigatórios
 * - Período obrigatório no formato MM/AAAA - MM/AAAA (ou MM/AAAA - Atual)
 * - Meses 01–12, e início <= fim quando houver fim
 */
export function validateEducationItem(
  e: Education,
  opts?: ValidateEducationOpts,
): EducationItemErrors {
  const { allowSingleYear = false } = opts ?? {};
  const errs: EducationItemErrors = {};

  // Obrigatórios
  if (!e.curso?.trim()) errs.curso = 'Informe o curso.';
  if (!e.instituicao?.trim()) errs.instituicao = 'Informe a instituição.';

  // Período
  const raw = (e.periodo || '').trim();
  if (!raw) {
    errs.periodo = 'Informe o período (ex.: 03/2016 - 12/2017).';
    return errs;
  }

  const parsed = parsePeriodo(raw, { allowSingleYear });
  if (!parsed.ok) {
    errs.periodo = 'Período inválido. Use MM/AAAA - MM/AAAA ou MM/AAAA - Atual.';
    return errs;
  }

  if (parsed.end && parsed.start! > parsed.end) {
    errs.periodo = 'Período inicial deve ser anterior ao final.';
    return errs;
  }

  return errs;
}

/**
 * Valida a lista de formações:
 * - exige ao menos uma (por padrão)
 * - agrega erros por id
 */
export function validateEducations(
  list: Education[],
  opts?: ValidateEducationOpts,
): EducationErrors {
  const { requireAtLeastOne = true } = opts ?? {};
  const byId: Record<string, EducationItemErrors> = {};

  if (requireAtLeastOne && (!list || list.length === 0)) {
    return { byId, list: 'Adicione ao menos uma formação.' };
  }

  for (const e of list ?? []) {
    byId[e.id] = validateEducationItem(e, opts);
  }

  return { byId };
}

// ===========================================================
// ================  CONVENIÊNCIAS DO APP  ===================
// ===========================================================

/** Retorna true se não houver nenhum erro nos dados pessoais (com flags) */
export function isPersonalValid(dados: PersonalData, opts?: ValidatePersonalOpts) {
  return Object.keys(validatePersonal(dados, opts)).length === 0;
}

/** Retorna a primeira mensagem de erro encontrada (útil para alerta simples) */
export function firstPersonalError(
  dados: PersonalData,
  opts?: ValidatePersonalOpts,
): string | null {
  const e = validatePersonal(dados, opts);
  const key = Object.keys(e)[0] as keyof PersonalData | undefined;
  return key ? e[key]! : null;
}

/** Passo 0: Dados Pessoais */
export function canProceedPersonal(state: ResumeState, opts?: ValidatePersonalOpts) {
  return isPersonalValid(state.dados, opts);
}

/** Passo 1: Objetivo & Formação (objetivo obrigatório + ao menos 1 formação válida) */
export function canProceedObjectiveAndEducation(
  state: ResumeState,
  personalOpts?: ValidatePersonalOpts,
  eduOpts?: ValidateEducationOpts,
) {
  // objetivo obrigatório neste passo; resumo já foi exigido no passo 0
  const pOk = isPersonalValid(state.dados, {
    ...personalOpts,
    requireResumo: false,
    requireObjetivo: true,
    maxObjetivo: personalOpts?.maxObjetivo ?? 160,
  });

  const edu = validateEducations(state.formacoes ?? [], {
    requireAtLeastOne: true,
    ...eduOpts,
  });

  const hasEduErrors =
    !!edu.list ||
    Object.values(edu.byId).some((it) => it.curso || it.instituicao || it.periodo);

  return pOk && !hasEduErrors;
}
