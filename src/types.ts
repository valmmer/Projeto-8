// src/types.ts

/** Nível de habilidade (skills) */
// src/types.ts
export type SkillLevel = "Básico" | "Intermediário" | "Avançado";

export interface Skill {
  id: string;
  nome: string;
  nivel: SkillLevel;
  /** Opcional: classifica habilidade (sem quebrar código antigo) */
  tipo?: 'Hard' | 'Soft';
} 
/** Dados pessoais do currículo */
export interface PersonalData {
  /** Obrigatórios básicos */
  nome: string;
  email: string;
  telefone: string;
  resumo: string;

  /** Campos opcionais */
  linkedin?: string;          // ← opcional
  objetivo?: string;          // usado no Objetivo Profissional (IA)
  cidadePais?: string;
  dataNascimento?: string;    // ISO "yyyy-mm-dd"
  github?: string;
  site?: string;
  foto?: string;              // DataURL ou URL da imagem
}

/** Habilidade */
export interface Skill {
  id: string;
  nome: string;
  nivel: SkillLevel;
}

/** Experiência profissional */
export interface Experience {
  id: string;
  empresa: string;
  cargo: string;
  periodo: string;    // ex.: "Jan/2023 — Atual"
  atual: boolean;     // indica se é o trabalho atual
  descricao: string;  // responsabilidades/resultados
}

/** Formação acadêmica */
export type Education = {
  id: string;
  instituicao: string;
  curso: string;
  periodo: string;   // "MM/YYYY - MM/YYYY" | "MM/YYYY - Atual"
};

/** Certificação */
export interface Certification {
  id: string;
  titulo: string;
  orgao: string;
  ano?: string;       // opcional
}

/** Idioma */
export interface Language {
  id: string;
  idioma: string;
  nivel: "Básico" | "Intermediário" | "Avançado" | "Nativo" | "Fluente";
}

/** Estado completo do currículo (ResumeContext) */
export interface ResumeState {
  dados: PersonalData;
  skills: Skill[];
  experiencias: Experience[];
  formacoes: Education[];
  certificacoes: Certification[];
  idiomas: Language[];
}
