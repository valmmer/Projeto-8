// src/state/initial.ts
import type { ResumeState } from '../types';

export const initial: ResumeState = {
  dados: {
    nome: '',
    email: '',
    telefone: '',
    resumo: '',
    // objetivo: '',   // opcional — deixe comentado se não quiser valor inicial
    // NÃO coloque opcionais aqui (deixe undefined):
    // linkedin, cidadePais, dataNascimento, github, site, foto
  },
  skills: [],
  experiencias: [],
  formacoes: [],
  certificacoes: [],
  idiomas: [],
};
