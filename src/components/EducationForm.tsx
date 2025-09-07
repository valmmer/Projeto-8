// src/components/ExperienceForm.tsx
import React from 'react';
import { useResume } from '../state/ResumeContext';
import ExperienceSection from './experience/ExperienceSection';
import type { Experience } from '../types'; // ✅ usa o tipo real

export default function ExperienceForm() {
  const { state, dispatch } = useResume();

  const experiencias: Experience[] = Array.isArray(state.experiencias)
    ? (state.experiencias as Experience[])
    : [];

  return (
    <section className="space-y-5">
      <p className="text-sm text-slate-600">
        Adicione suas experiências profissionais. Use{' '}
        <span className="font-medium">Cidade - Estado</span> na localidade; o
        traço é aplicado automaticamente.
      </p>

      <ExperienceSection
        value={experiencias}
        onChange={(next) => dispatch({ type: 'SET_EXPS', payload: next })}
      />
    </section>
  );
}
