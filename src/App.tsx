// src/App.tsx
// ============================================================================
// Wizard do currículo com layout responsivo e preview “sticky” no desktop.
// Etapa 6 usa o painel <Review />; etapas 0..4 mostram o <ResumePreview> à direita.
// Dependência de PDF: servidor (Puppeteer) + impressão nativa (print.css).
// ============================================================================

import { useMemo, useState, useEffect, useRef } from 'react';
import { ResumeProvider, useResume } from './state/ResumeContext';
import PersonalForm from './components/PersonalForm';
import ObjectiveForm from './components/ObjectiveForm';
import SkillsForm from './components/SkillsForm';
import ExperienceForm from './components/ExperienceForm';
import CertificationsForm from './components/CertificationsForm'; // ✅ caminho corrigido
import LanguagesForm from './components/LanguagesForm';
import Stepper from './components/Stepper';
import WizardNav from './components/WizardNav';
import Review from './components/Review';

// ✅ componente default + tipo via "import type"
import ResumePreview from './components/preview/ResumePreview';
import type { ResumeTemplateId } from './components/preview/ResumePreview';

// 🔗 Botão “Baixar PDF (servidor)” — chama /api/print/pdf (Puppeteer)
import { downloadServerPDF } from './lib/serverPrint';

// ---------------------------------------------------------------------------
// Validações mínimas inline (pode mover para src/state/validators.ts)
// ---------------------------------------------------------------------------
type AnyState =
  ReturnType<typeof useResume> extends infer R
    ? R extends { state: infer S }
      ? S
      : never
    : never;

function isNonEmpty(str: unknown) {
  return typeof str === 'string' && str.trim().length > 0;
}
function validateEmail(email?: string) {
  if (!email) return 'Informe um e-mail.';
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  return ok ? undefined : 'E-mail inválido.';
}
function validatePersonal(
  dados: AnyState extends { dados: infer D } ? D : any,
) {
  const errors: Record<string, string> = {};
  if (!isNonEmpty(dados?.nome)) errors.nome = 'Informe seu nome completo.';
  const e = validateEmail(dados?.email);
  if (e) errors.email = e;
  if (!isNonEmpty(dados?.telefone)) errors.telefone = 'Informe um telefone.';
  if (!isNonEmpty(dados?.cidadePais))
    errors.cidadePais = 'Informe cidade/país.';
  return errors;
}
function canProceedObjectiveAndEducation(state: AnyState) {
  const hasObjetivo = isNonEmpty((state as any)?.dados?.objetivo);
  const edus = (state as any)?.formacoes ?? [];
  const hasEdu = Array.isArray(edus) && edus.length >= 1;
  return hasObjetivo && hasEdu;
}

// ---------------------------------------------------------------------------
// Breakpoint helper
// ---------------------------------------------------------------------------
function useMediaQuery(query: string) {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(query);
    const onChange = () => setMatch(m.matches);
    onChange();
    m.addEventListener('change', onChange);
    return () => m.removeEventListener('change', onChange);
  }, [query]);
  return match;
}

function Wizard() {
  const { state } = useResume();
  const [step, setStep] = useState(0);

  // ✅ template do currículo (conforme ResumePreview exporta)
  const [template, setTemplate] = useState<ResumeTemplateId>('classico');

  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // ---------------- Passos e validações ----------------
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

  const personalErrors = useMemo(
    () => validatePersonal(state.dados),
    [state.dados],
  );
  const personalHasErrors = Object.keys(personalErrors).length > 0;

  const fieldLabels: Record<string, string> = {
    nome: 'Nome completo',
    cidadePais: 'Cidade / País',
    dataNascimento: 'Data de nascimento',
    email: 'Email',
    telefone: 'Telefone (DDD/DDI)',
    resumo: 'Resumo profissional',
    objetivo: 'Objetivo',
    site: 'Portfólio / Site',
    github: 'GitHub',
    linkedin: 'LinkedIn',
  };

  const canNext = useMemo(() => {
    switch (step) {
      case 0:
        return !personalHasErrors;
      case 1:
        return canProceedObjectiveAndEducation(state as any);
      case 2:
        return state.skills.length >= 1;
      case 3:
        return state.experiencias.length >= 1;
      default:
        return true;
    }
  }, [step, state, personalHasErrors]);

  const goNext = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handleNext = () => {
    if (step === 0 && personalHasErrors) {
      const list = Object.entries(personalErrors)
        .map(([k, v]) => `• ${fieldLabels[k] ?? k}: ${v}`)
        .join('\n');
      alert(`Por favor, corrija:\n${list}`);
      return;
    }
    if (!canNext) {
      alert(
        step === 1
          ? 'Preencha o OBJETIVO e adicione ao menos UMA FORMAÇÃO válida para continuar.'
          : 'Preencha todos os campos obrigatórios para continuar.',
      );
      return;
    }
    if (step < steps.length - 1) goNext();
    else {
      console.log('Currículo finalizado:', state);
      alert('Currículo concluído com sucesso!');
    }
  };

  // ---------------- Preview sticky (desktop) com auto-fit + zoom ------------
  const [zoom, setZoom] = useState(1);
  const [autoFit, setAutoFit] = useState(true);
  const [fitScale, setFitScale] = useState(1);
  const bodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isDesktop || !bodyRef.current) return;
    const el = bodyRef.current;

    const compute = () => {
      const cs = getComputedStyle(el);
      const padX =
        parseFloat(cs.paddingLeft || '0') + parseFloat(cs.paddingRight || '0');
      const avail = el.clientWidth - padX - 8; // folga
      const scale = Math.max(0.6, Math.min(1, avail / 794)); // 794px ≈ A4 96dpi
      setFitScale(scale);
      if (autoFit) setZoom(scale);
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    window.addEventListener('orientationchange', compute);
    return () => {
      ro.disconnect();
      window.removeEventListener('orientationchange', compute);
    };
  }, [autoFit, isDesktop]);

  const effectiveZoom = isDesktop ? (autoFit ? fitScale : zoom) : 1;

  // ---------------- Etapa 6: painel de revisão central -----------------------
  if (step === 5) {
    return (
      <main className="page-container px-4 md:px-6 py-5">
        <Stepper steps={steps} current={step} />

        <div className="mt-6 flex justify-center">
          <div className="w-full max-w-[980px]">
            {/* Escolha de template e revisão final */}
            <Review template={template} onTemplateChange={setTemplate} />
          </div>
        </div>

        <div className="mt-8">
          <WizardNav
            canBack
            canNext={false}
            onBack={() => setStep(4)}
            onNext={() => {}}
            nextLabel="Concluir"
          />
        </div>
      </main>
    );
  }

  // ---------------- Demais etapas (0..4): form + preview sticky --------------
  return (
    <main className="page-container px-4 md:px-6 py-5">
      <div className="layout-2col">
        {/* ESQUERDA — formulários */}
        <section>
          <Stepper steps={steps} current={step} />

          {step === 0 && personalHasErrors && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <strong>Corrija os campos abaixo:</strong>
              <ul className="mt-2 list-disc pl-5">
                {Object.entries(personalErrors).map(([k, v]) => (
                  <li key={k}>
                    <span className="font-medium">{fieldLabels[k] ?? k}:</span>{' '}
                    {v}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-8 mt-6">
            {step === 0 && <PersonalForm submitted errors={personalErrors} />}
            {step === 1 && <ObjectiveForm />}
            {step === 2 && <SkillsForm />}
            {step === 3 && <ExperienceForm />}
            {step === 4 && (
              <>
                <CertificationsForm />
                <LanguagesForm />
              </>
            )}
          </div>

          <div className="mt-8">
            <WizardNav
              canBack={step > 0}
              canNext={canNext && step < steps.length - 1}
              onBack={back}
              onNext={handleNext}
              nextLabel={
                step === steps.length - 2 ? 'Ir para revisão' : 'Próximo'
              }
            />
          </div>
        </section>

        {/* DIREITA — preview sticky (desktop) */}
        {isDesktop && (
          <aside className="preview-shell">
            <div className="preview-card">
              <div className="preview-toolbar">
                <label className="text-sm text-slate-600 mr-2">Zoom</label>
                <input
                  className="preview-zoom"
                  type="range"
                  min={0.8}
                  max={1.3}
                  step={0.05}
                  value={Number(effectiveZoom.toFixed(2))}
                  onChange={(e) => {
                    setZoom(parseFloat(e.currentTarget.value));
                    setAutoFit(false);
                  }}
                  disabled={autoFit}
                  title={
                    autoFit
                      ? 'Ajuste automático ativo'
                      : 'Arraste para ajustar o zoom'
                  }
                />
                <button
                  className="btn btn-subtle"
                  onClick={() => setAutoFit(true)}
                >
                  Ajustar
                </button>

                {/* 🖨️ Impressão nativa (usa print.css) */}
                <button
                  className="btn btn-outline"
                  onClick={() => window.print()}
                >
                  Imprimir
                </button>

                {/* 📄 PDF do servidor (Puppeteer + @media print) */}
                <button
                  className="btn btn-primary"
                  onClick={() => downloadServerPDF()}
                  title="Gera PDF com texto selecionável no servidor"
                >
                  Baixar PDF (servidor)
                </button>
              </div>

              <div className="preview-body" ref={bodyRef}>
                <div
                  className="preview-canvas"
                  style={{ transform: `scale(${effectiveZoom})` }}
                >
                  {/* Usa o mesmo modelo escolhido */}
                  <ResumePreview template={template} />
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </main>
  );
}

// Provider + guard de hotkeys
export default function App() {
  useEffect(() => {
    const isEditable = (t: EventTarget | null) =>
      t instanceof HTMLElement &&
      (t.tagName === 'INPUT' ||
        t.tagName === 'TEXTAREA' ||
        t.isContentEditable);

    const guardKey = (e: KeyboardEvent) => {
      if ((e.key === ' ' || e.code === 'Space') && isEditable(e.target)) {
        e.stopPropagation();
        (e as any).stopImmediatePropagation?.();
      }
    };
    const guardBeforeInput = (e: Event) => {
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
      window.removeEventListener(
        'beforeinput',
        guardBeforeInput as any,
        { capture: true } as any,
      );
    };
  }, []);

  return (
    <ResumeProvider>
      <Wizard />
    </ResumeProvider>
  );
}
