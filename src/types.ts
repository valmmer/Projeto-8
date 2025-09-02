export type SkillLevel = "Básico" | "Intermediário" | "Avançado";

/** Dados pessoais */
export interface PersonalData {
  nome: string;
  email: string;
  telefone: string;
  linkedin: string;   // pode manter string vazia "" quando não tiver
  resumo: string;

  // novo (para IA do Objetivo)
  objetivo?: string;  // ✅ adicionado

  // opcionais (não obrigatórios, mas úteis em currículo)
  cidadePais?: string;
  dataNascimento?: string;   // formato ISO "yyyy-mm-dd"
  github?: string;
  site?: string;
  foto?: string;             // DataURL ou URL da imagem
}

export interface Skill {
  id: string;
  nome: string;
  nivel: SkillLevel;
}

export interface Experience {
  id: string;
  empresa: string;
  cargo: string;
  periodo: string;   // ex: "Jan/2023 — Atual"
  atual: boolean;
  descricao: string;
}

export interface Education {
  id: string;
  curso: string;
  instituicao: string;
  periodo: string;   // ex: "2016 — 2017"
}

export interface Certification {
  id: string;
  titulo: string;
  orgao: string;
  ano?: string;
}

export interface Language {
  id: string;
  idioma: string;
  nivel: "Básico" | "Intermediário" | "Avançado" | "Nativo" | "Fluente";
}

export interface ResumeState {
  dados: PersonalData;
  skills: Skill[];
  experiencias: Experience[];
  formacoes: Education[];
  certificacoes: Certification[];
  idiomas: Language[];
}
