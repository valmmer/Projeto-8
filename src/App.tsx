import { useMemo, useState } from "react";
import { ResumeProvider, useResume } from "./state/ResumeContext";
import PersonalForm from "./components/PersonalForm";
import ObjectiveForm from "./components/ObjectiveForm";
import EducationForm from "./components/EducationForm";
import SkillsForm from "./components/SkillsForm";
import ExperienceForm from "./components/ExperienceForm";
import CertificationsForm from "./components/CertificationsForm";
import LanguagesForm from "./components/LanguagesForm";
import Stepper from "./components/Stepper";
import WizardNav from "./components/WizardNav";
import Review from "./components/Review";

function Wizard() {
  const { state } = useResume();
  const [step, setStep] = useState(0);

  const steps = useMemo(
    () => [
      { id: 1, label: "Dados pessoais" },
      { id: 2, label: "Objetivo & Formação" },
      { id: 3, label: "Habilidades" },
      { id: 4, label: "Experiência" },
      { id: 5, label: "Certif. & Idiomas" },
      { id: 6, label: "Revisão" },
    ],
    []
  );

  const canNext = useMemo(() => {
    const d = state.dados;
    switch (step) {
      case 0:
        return !!(d.nome && d.email && d.telefone);
      case 1:
        return true;
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

  function next() {
    if (step === steps.length - 1) {
      // 🔥 Ação final ao concluir
      console.log("Currículo finalizado:", state);
      alert("Currículo concluído com sucesso!");
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

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
            canNext={canNext && step < steps.length}
            onBack={back}
            onNext={next}
            nextLabel={
              step === steps.length - 2
                ? "Ir para revisão"
                : step === steps.length - 1
                ? "Concluir"
                : "Próximo"
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
  return (
    <ResumeProvider>
      <Wizard />
    </ResumeProvider>
  );
}
