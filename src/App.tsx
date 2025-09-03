// App.tsx
import { useMemo, useState, useEffect } from 'react';
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

// ✅ validadores
import {
  canProceedPersonal,
  canProceedObjectiveAndEducation,
} from './state/personal';

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
    [],
  );

  // ✅ regra de habilitação do botão "Próximo"
  const canNext = useMemo(() => {
    switch (step) {
      case 0:
        return canProceedPersonal(state);
      case 1:
        return canProceedObjectiveAndEducation(state);
      case 2:
        return state.skills.length >= 1;
      case 3:
        return state.experiencias.length >= 1;
      case 4:
        return true;
      default:
        return true;
    }
  }, [step, state]);

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handleNext = () => {
    if (!canNext) {
      if (step === 1) {
        window.alert(
          'Preencha o OBJETIVO e adicione ao menos UMA FORMAÇÃO válida para continuar.',
        );
      } else {
        window.alert('Preencha todos os campos obrigatórios para continuar.');
      }
      return;
    }
    if (step < steps.length - 1) {
      next();
    } else {
      console.log('Wizard concluído');
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-[1fr_2fr] bg-gray-100">
      {/* Lado esquerdo = wizard */}
      <div className="h-full overflow-y-auto p-6 bg-gray-50 border-r border-gray-200">
        <Stepper steps={steps} current={step} />

        <div className="space-y-8 mt-6">
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

        <div className="mt-8">
          <WizardNav
            canBack={step > 0}
            canNext={canNext && step < steps.length - 1}
            onBack={back}
            onNext={handleNext}
            nextLabel={
              step === steps.length - 2
                ? 'Ir para revisão'
                : step === steps.length - 1
                  ? 'Concluir'
                  : 'Próximo'
            }
          />
        </div>
      </div>

      {/* Lado direito = preview em tempo real */}
      <div className="h-full overflow-y-auto p-6 bg-gray-100 hidden lg:flex justify-center items-start">
        <div className="bg-white shadow-xl rounded-lg w-[800px] min-h-[90%] p-8">
          <Review />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  // 🔒 Guard global contra hotkeys que “comem” a barra de espaço
  // Explicação:
  // - Muitos apps têm listeners globais (em window/document) para atalhos.
  // - Quando o foco está em um campo editável (INPUT/TEXTAREA/contentEditable),
  //   queremos que a tecla SPACE funcione normalmente.
  // - Aqui, nós NÃO damos preventDefault no campo; apenas paramos a propagação
  //   para impedir que algum listener global intercepte a tecla Space.
  useEffect(() => {
    const isEditable = (t: EventTarget | null) => {
      if (!(t instanceof HTMLElement)) return false;
      const tag = t.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || t.isContentEditable;
    };

    const guardKey = (e: KeyboardEvent) => {
      if ((e.key === ' ' || e.code === 'Space') && isEditable(e.target)) {
        // deixa o campo inserir o espaço (sem preventDefault),
        // mas impede listeners globais de capturar:
        e.stopPropagation();
        // alguns libs usam stopImmediatePropagation; tentamos também:
        (e as any).stopImmediatePropagation?.();
      }
    };

    const guardBeforeInput = (e: Event) => {
      // Alguns libs escutam beforeinput. Paramos só a propagação.
      const ie = e as any;
      if (
        ie?.inputType === 'insertText' &&
        ie?.data === ' ' &&
        isEditable(e.target)
      ) {
        e.stopPropagation();
        (e as any).stopImmediatePropagation?.();
      }
    };

    window.addEventListener('keydown', guardKey, { capture: true });
    window.addEventListener('keypress', guardKey, { capture: true });
    window.addEventListener('beforeinput', guardBeforeInput as any, {
      capture: true,
    });

    return () => {
      window.removeEventListener('keydown', guardKey, { capture: true } as any);
      window.removeEventListener('keypress', guardKey, {
        capture: true,
      } as any);
      window.removeEventListener('beforeinput', guardBeforeInput as any, {
        capture: true,
      });
    };
  }, []);

  return (
    <ResumeProvider>
      <Wizard />
    </ResumeProvider>
  );
}
