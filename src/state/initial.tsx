import type { ResumeState } from '../types';

export const initial: ResumeState = {
  dados: {
    nome: '',
    email: '',
    telefone: '',
    linkedin: '',
    resumo: '',
    cidadePais: '',
    dataNascimento: '',
    github: '',
    site: '',
    foto: '',
  },
  skills: [],
  experiencias: [],
  formacoes: [],
  certificacoes: [],
  idiomas: [],
};
