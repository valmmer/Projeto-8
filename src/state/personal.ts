import type { PersonalData, ResumeState } from '../types';

// Helpers simples (sem libs)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const urlRegex = /^https?:\/\/[\w.-]+(?:\.[\w\.-]+)+(?:[^\s]*)$/i;
const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

export type PersonalErrors = Partial<Record<keyof PersonalData, string>>;

export function validatePersonal(
  dados: PersonalData,
  opts?: { maxResumo?: number }
): PersonalErrors {
  const maxResumo = opts?.maxResumo ?? 600;
  const errors: PersonalErrors = {};

  // Obrigatórios
  if (!dados.nome?.trim()) errors.nome = 'Informe seu nome completo.';
  if (!dados.email?.trim()) errors.email = 'Informe um email.';
  if (!dados.telefone?.trim()) errors.telefone = 'Informe um telefone.';
  if (!dados.resumo?.trim()) errors.resumo = 'Escreva um breve resumo.';

  // Formatos
  if (dados.email && !emailRegex.test(dados.email)) {
    errors.email = 'Email inválido.';
  }
  if (dados.linkedin && !urlRegex.test(dados.linkedin)) {
    errors.linkedin = 'URL inválida (use https://...).';
  }
  if (dados.github && dados.github.trim() && !urlRegex.test(dados.github)) {
    errors.github = 'URL inválida (use https://...).';
  }
  if (dados.site && dados.site.trim() && !urlRegex.test(dados.site)) {
    errors.site = 'URL inválida (use https://...).';
  }
  if (typeof dados.resumo === 'string' && dados.resumo.length > maxResumo) {
    errors.resumo = `Máx. ${maxResumo} caracteres.`;
  }

  // Data de nascimento (opcional): ISO + range
  if (dados.dataNascimento) {
    if (!isoDateRegex.test(dados.dataNascimento)) {
      errors.dataNascimento = 'Use formato yyyy-mm-dd.';
    } else {
      const d = new Date(dados.dataNascimento);
      const min = new Date('1900-01-01');
      const hoje = new Date();
      if (isNaN(d.getTime()) || d < min || d > hoje) {
        errors.dataNascimento = 'Data inválida.';
      }
    }
  }

  return errors;
}

/** Conveniência: válido = sem erros */
export function isPersonalValid(dados: PersonalData) {
  return Object.keys(validatePersonal(dados)).length === 0;
}

/** Pega a primeira mensagem de erro (útil para toast) */
export function firstPersonalError(dados: PersonalData): string | null {
  const e = validatePersonal(dados);
  const key = Object.keys(e)[0] as keyof PersonalData | undefined;
  return key ? e[key]! : null;
}

/** Se quiser validar o passo no contexto do estado inteiro */
export function canProceedPersonal(state: ResumeState) {
  return isPersonalValid(state.dados);
}