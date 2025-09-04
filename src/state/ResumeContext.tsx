// src/state/ResumeContext.tsx
import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch,
  useEffect,
} from 'react';

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

/** Ações do estado global */
type Action =
  | { type: 'SET_DADOS'; payload: Partial<PersonalData> }
  | { type: 'NORMALIZE_DADOS' }
  | { type: 'ADD_SKILL'; payload: Skill }
  | { type: 'REMOVE_SKILL'; payload: string }
  | { type: 'ADD_EXP'; payload: Experience }
  | { type: 'REMOVE_EXP'; payload: string }
  | { type: 'ADD_EDU'; payload: Education }
  | { type: 'REMOVE_EDU'; payload: string }
  | { type: 'SET_EDUS'; payload: Education[] }
  | { type: 'ADD_CERT'; payload: Certification }
  | { type: 'REMOVE_CERT'; payload: string }
  | { type: 'ADD_LANG'; payload: Language }
  | { type: 'REMOVE_LANG'; payload: string }
  | { type: 'HYDRATE'; payload: ResumeState }; // opcional: restaurar estado

// ---------------- Utils ----------------
/** util id (fallback quando randomUUID não existir) */
export function rid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return (crypto as any).randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

function withId<T extends { id?: string }>(item: T): T & { id: string } {
  return { ...item, id: item.id ?? rid() };
}

// ---------------- Sanitização de payload (usar só na saída) ----------------
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

  // Aparar apenas campos "curtos"
  if (typeof out.nome === 'string') out.nome = out.nome.trim();
  if (typeof out.email === 'string') out.email = out.email.trim();
  if (typeof out.telefone === 'string') out.telefone = out.telefone.trim();

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

/** Normalização completa para usar ao concluir/submeter (opcional) */
export function normalizePersonalForSubmit(d: PersonalData): PersonalData {
  const base = cleanPersonalPayload(d);
  return { ...d, ...base };
}

/** Reducer central do currículo */
function reducer(state: ResumeState, action: Action): ResumeState {
  switch (action.type) {
    case 'HYDRATE': {
      return action.payload;
    }

    case 'SET_DADOS': {
      return { ...state, dados: { ...state.dados, ...action.payload } };
    }
    case 'NORMALIZE_DADOS': {
      const clean = cleanPersonalPayload(state.dados);
      return { ...state, dados: { ...state.dados, ...clean } };
    }

    // ---- Skills
    case 'ADD_SKILL':
      return { ...state, skills: [...state.skills, withId(action.payload)] };
    case 'REMOVE_SKILL':
      return {
        ...state,
        skills: state.skills.filter((s) => s.id !== action.payload),
      };

    // ---- Experiências
    case 'ADD_EXP':
      return {
        ...state,
        experiencias: [...state.experiencias, withId(action.payload)],
      };
    case 'REMOVE_EXP':
      return {
        ...state,
        experiencias: state.experiencias.filter((e) => e.id !== action.payload),
      };

    // ---- Formações
    case 'ADD_EDU':
      return {
        ...state,
        formacoes: [...state.formacoes, withId(action.payload)],
      };
    case 'REMOVE_EDU':
      return {
        ...state,
        formacoes: state.formacoes.filter((f) => f.id !== action.payload),
      };
    case 'SET_EDUS':
      return {
        ...state,
        formacoes: action.payload.map((f) => withId(f)), // garante id nos itens carregados
      };

    // ---- Certificações
    case 'ADD_CERT':
      return {
        ...state,
        certificacoes: [...state.certificacoes, withId(action.payload)],
      };
    case 'REMOVE_CERT':
      return {
        ...state,
        certificacoes: state.certificacoes.filter(
          (c) => c.id !== action.payload,
        ),
      };

    // ---- Idiomas
    case 'ADD_LANG':
      return { ...state, idiomas: [...state.idiomas, withId(action.payload)] };
    case 'REMOVE_LANG':
      return {
        ...state,
        idiomas: state.idiomas.filter((l) => l.id !== action.payload),
      };

    default:
      return state;
  }
}

// ---------------- Contexto ----------------
const Ctx = createContext<{
  state: ResumeState;
  dispatch: Dispatch<Action>;
} | null>(null);

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  // (Opcional) Auto-save leve no localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cv_state_v1', JSON.stringify(state));
    } catch {}
  }, [state]);

  // (Opcional) Auto-hydrate no primeiro load
  useEffect(() => {
    try {
      const raw = localStorage.getItem('cv_state_v1');
      if (raw) {
        const saved = JSON.parse(raw) as ResumeState;
        // garante que cada coleção tem id
        saved.skills = saved.skills?.map(withId) ?? [];
        saved.experiencias = saved.experiencias?.map(withId) ?? [];
        saved.formacoes = saved.formacoes?.map(withId) ?? [];
        saved.certificacoes = saved.certificacoes?.map(withId) ?? [];
        saved.idiomas = saved.idiomas?.map(withId) ?? [];
        dispatch({ type: 'HYDRATE', payload: saved });
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useResume() {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error('useResume deve ser usado dentro de <ResumeProvider>');
  return ctx;
}
