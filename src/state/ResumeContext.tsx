import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type {
  ResumeState,
  PersonalData,
  Skill,
  Experience,
  Education,
  Certification,
  Language,
} from '../types';
import { initial } from './initial';

type Action =
  | { type: 'SET_DADOS'; payload: Partial<PersonalData> }
  | { type: 'ADD_SKILL'; payload: Skill }
  | { type: 'REMOVE_SKILL'; payload: string }
  | { type: 'ADD_EXP'; payload: Experience }
  | { type: 'REMOVE_EXP'; payload: string }
  | { type: 'ADD_EDU'; payload: Education } // NOVO
  | { type: 'REMOVE_EDU'; payload: string } // NOVO
  | { type: 'ADD_CERT'; payload: Certification } // NOVO
  | { type: 'REMOVE_CERT'; payload: string } // NOVO
  | { type: 'ADD_LANG'; payload: Language } // NOVO
  | { type: 'REMOVE_LANG'; payload: string }; // NOVO

function reducer(state: ResumeState, action: Action): ResumeState {
  switch (action.type) {
    case 'SET_DADOS':
      return { ...state, dados: { ...state.dados, ...action.payload } };
    case 'ADD_SKILL':
      return { ...state, skills: [...state.skills, action.payload] };
    case 'REMOVE_SKILL':
      return {
        ...state,
        skills: state.skills.filter((s) => s.id !== action.payload),
      };
    case 'ADD_EXP':
      return {
        ...state,
        experiencias: [...state.experiencias, action.payload],
      };
    case 'REMOVE_EXP':
      return {
        ...state,
        experiencias: state.experiencias.filter((e) => e.id !== action.payload),
      };

    case 'ADD_EDU':
      return { ...state, formacoes: [...state.formacoes, action.payload] };
    case 'REMOVE_EDU':
      return {
        ...state,
        formacoes: state.formacoes.filter((f) => f.id !== action.payload),
      };

    case 'ADD_CERT':
      return {
        ...state,
        certificacoes: [...state.certificacoes, action.payload],
      };
    case 'REMOVE_CERT':
      return {
        ...state,
        certificacoes: state.certificacoes.filter(
          (c) => c.id !== action.payload
        ),
      };

    case 'ADD_LANG':
      return { ...state, idiomas: [...state.idiomas, action.payload] };
    case 'REMOVE_LANG':
      return {
        ...state,
        idiomas: state.idiomas.filter((l) => l.id !== action.payload),
      };

    default:
      return state;
  }
}

const Ctx = createContext<{
  state: ResumeState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useResume() {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error('useResume deve ser usado dentro de <ResumeProvider>');
  return ctx;
}

/** util id */
export function rid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    // @ts-ignore
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}
