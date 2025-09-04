import type { SkillLevel } from '../../types';

export const MAX_SKILLS = 30;

export const LEVEL_ORDER: Record<SkillLevel, number> = {
  'Avançado': 0,
  'Intermediário': 1,
  'Básico': 2,
};

export const HARD_SUGGESTIONS = [
  'React', 'TypeScript', 'Node.js', 'SQL', 'Docker',
  'Git', 'Linux', 'Next.js', 'Tailwind CSS', 'AWS',
  'Java', '.NET', 'Python', 'Kubernetes', 'GraphQL',
  'Windows Server', 'Linux', 'SQL Server','MYSQL',
  
];

export const SOFT_SUGGESTIONS = [
  'Comunicação', 'Trabalho em equipe', 'Resolução de problemas',
  'Proatividade', 'Organização', 'Gestão do tempo', 'Adaptabilidade',
  'Pensamento crítico', 'Liderança', 'Atenção aos detalhes',
];
