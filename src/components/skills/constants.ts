// src/components/skills/constants.ts
import type { SkillLevel } from '../../types';

export const MAX_SKILLS = 30;

export const LEVEL_ORDER: Record<SkillLevel, number> = {
  Avançado: 0,
  Intermediário: 1,
  Básico: 2,
};

// Hard (limpei duplicados e normalizei MySQL)
export const HARD_SUGGESTIONS = [
  'React',
  'TypeScript',
  'Node.js',
  'SQL',
  'Docker',
  'Git',
  'Linux',
  'Next.js',
  'Tailwind CSS',
  'AWS',
  'Java',
  '.NET',
  'Python',
  'Kubernetes',
  'GraphQL',
  'Windows Server',
  'SQL Server',
  'MySQL',
];

// Soft (+4 novas no final)
export const SOFT_SUGGESTIONS = [
  'Comunicação',
  'Trabalho em equipe',
  'Resolução de problemas',
  'Proatividade',
  'Organização',
  'Gestão do tempo',
  'Adaptabilidade',
  'Pensamento crítico',
  'Liderança',
  'Atenção aos detalhes',
  'Empatia',
  'Negociação',
  'Criatividade',
  'Inteligência emocional',
];
