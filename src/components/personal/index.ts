// src/components/personal/index.ts
export type PersonalErrors = {
  nome?: string;
  cidadePais?: string;
  dataNascimento?: string;
  email?: string;
  telefone?: string;
  linkedin?: string;
  github?: string;
  site?: string;
  resumo?: string;
};

export type Dados = {
  foto?: string;
  nome?: string;
  cidadePais?: string;
  dataNascimento?: string;  // ISO yyyy-mm-dd
  email?: string;
  telefone?: string;
  linkedin?: string;
  github?: string;
  site?: string;
  resumo?: string;
};
