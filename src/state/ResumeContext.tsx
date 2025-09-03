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
  | { type: 'ADD_EDU'; payload: Education }
  | { type: 'REMOVE_EDU'; payload: string }
  | { type: 'ADD_CERT'; payload: Certification }
  | { type: 'REMOVE_CERT'; payload: string }
  | { type: 'ADD_LANG'; payload: Language }
  | { type: 'REMOVE_LANG'; payload: string };

// ---------------- Sanitização de payload ----------------
function trimOrUndef(v: unknown): any {
  if (typeof v !== 'string') return v;
  const t = v.trim();
  return t === '' ? undefined : t;
}

/**
 * Normaliza apenas campos que não atrapalham a digitação.
 * ⚠️ NÃO aparar `resumo` e `objetivo` aqui (para não perder espaços finais durante onChange).
 */
function cleanPersonalPayload(p: Partial<PersonalData>): Partial<PersonalData> {
  const out: Partial<PersonalData> = { ...p };

  // aparar básicos que não são texto livre longo
  if (typeof out.nome === 'string') out.nome = out.nome.trim();
  if (typeof out.email === 'string') out.email = out.email.trim();
  if (typeof out.telefone === 'string') out.telefone = out.telefone.trim();

  // ❌ NÃO aparar campos de texto livre (evita engolir espaços finais durante a digitação)
  // if (typeof out.resumo === 'string') out.resumo = out.resumo.trim();
  // if (typeof (out as any).objetivo === 'string') (out as any).objetivo = (out as any).objetivo.trim();

  // opcionais: "" -> undefined
  if ('linkedin' in out) out.linkedin = trimOrUndef(out.linkedin);
  if ('github' in out) out.github = trimOrUndef(out.github);
  if ('site' in out) out.site = trimOrUndef(out.site);
  if ('cidadePais' in out) out.cidadePais = trimOrUndef(out.cidadePais);
  if ('dataNascimento' in out)
    out.dataNascimento = trimOrUndef(out.dataNascimento);
  if ('foto' in out) out.foto = trimOrUndef(out.foto);

  return out;
}

function reducer(state: ResumeState, action: Action): ResumeState {
  switch (action.type) {
    case 'SET_DADOS': {
      const clean = cleanPersonalPayload(action.payload);
      return { ...state, dados: { ...state.dados, ...clean } };
    }
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
          (c) => c.id !== action.payload,
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
