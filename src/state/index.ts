export { useResume } from './ResumeContext';
export type { ResumeState, Experience, Education, Skill, Certification, Language, PersonalData } from '../types';

// util simples pra id
export function rid() {
  return Math.random().toString(36).slice(2, 10);
}
