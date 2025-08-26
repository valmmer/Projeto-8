import { useMemo, useState } from 'react';
import { ResumeProvider, useResume } from './state/ResumeContext';
import PersonalForm from './components/PersonalForm';
import ObjectiveForm from './components/ObjectiveForm';
import EducationForm from './components/EducationForm';
import SkillsForm from './components/SkillsForm';
import ExperienceForm from './components/ExperienceForm';
import CertificationsForm from './components/CertificationsForm';
import LanguagesForm from './components/LanguagesForm';
import Stepper from './components/Stepper';
import WizardNav from './components/WizardNav';
import Review from './components/Review';

function Wizard() {
  const { state } = useResume();
  const [step, setStep] = useState(0);

  const steps = useMemo(
    () => [
      { id: 1, label: 'Dados pessoais' },
      { id: 2, label: 'Objetivo & Formação' },
      { id: 3, label: 'Habilidades' },
      { id: 4, label: 'Experiência' },
      { id: 5, label: 'Certif. & Idiomas' },
      { id: 6, label: 'Revisão' },
    ],
    []
  );

  // validação simples por etapa (habilita "Próximo")
  const canNext = useMemo(() => {
    const d = state.dados;
    switch (step) {
      case 0:
        return !!(d.nome && d.email && d.telefone); // básicos
      case 1:
        return true; // opcional validar ao menos 1 formação
      case 2:
        return state.skills.length >= 1;
      case 3:
        return state.experiencias.length >= 1;
      case 4:
        return true; // cert/idiomas opcionais
      default:
        return true;
    }
  }, [step, state]);

  function next() {
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  return (
    <div className="h-screen grid grid-cols-2">
      {/* Esquerda: conteúdo do wizard */}
      <div className="h-full overflow-y-auto p-6">
        <Stepper steps={steps} current={step} />

        <div className="space-y-8">
          {step === 0 && <PersonalForm />}
          {step === 1 && (
            <>
              <ObjectiveForm />
              <EducationForm />
            </>
          )}
          {step === 2 && <SkillsForm />}
          {step === 3 && <ExperienceForm />}
          {step === 4 && (
            <>
              <CertificationsForm />
              <LanguagesForm />
            </>
          )}
          {step === 5 && <Review />}
        </div>

        <WizardNav
          canBack={step > 0}
          canNext={canNext && step < steps.length - 1}
          onBack={back}
          onNext={next}
          nextLabel={
            step === steps.length - 2
              ? 'Ir para revisão'
              : step === steps.length - 1
              ? 'Concluir'
              : 'Próximo'
          }
        />
      </div>

      {/* Direita: preview live em todas as etapas (menos na Review, onde mostramos ampliado) */}
      <div className="h-full overflow-y-auto p-8 bg-white hidden lg:block">
        {/* preview leve (reutiliza o mesmo componente) */}
        <div className="scale-[0.95] origin-top-left">
          <Review />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ResumeProvider>
      <Wizard />
    </ResumeProvider>
  );
}
