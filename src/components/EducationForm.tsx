// src/components/EducationForm.tsx
import { useResume } from '../state/ResumeContext';
import EducationSection from './education/EducationSection';
import type { Education } from '../types';

export default function EducationForm() {
  const { state, dispatch } = useResume();

  // Troque a chave conforme seu estado: 'formacoes' ou 'educacoes'
  const educations: Education[] = Array.isArray((state as any).formacoes)
    ? ((state as any).formacoes as Education[])
    : Array.isArray((state as any).educacoes)
      ? ((state as any).educacoes as Education[])
      : [];

  return (
    <section className="space-y-5">
      <p className="text-sm text-slate-600">
        Adicione sua formação acadêmica. Não precisa mês; só o ano.
      </p>

      <EducationSection
        value={educations}
        // ✅ ENVIA ARRAY de Education; não use SET_EXPS aqui
        onChange={(next) => dispatch({ type: 'SET_EDUS', payload: next })}
      />
    </section>
  );
}
