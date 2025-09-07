// ============================================================================
// Wizard do currículo com layout responsivo e preview “sticky” no desktop.
// Etapa 6 usa o painel <Review /> (centralizado) e permite trocar o template.
// OBS: os templates já rendem #cv-page; o ResumePreview não deve criar outro.
// ============================================================================

import { useMemo, useState, useEffect, useRef } from 'react';
import { ResumeProvider, useResume } from './state/ResumeContext';

import PersonalForm from './components/PersonalForm';
import ObjectiveForm from './components/ObjectiveForm';
import SkillsForm from './components/SkillsForm';
import ExperienceForm from './components/ExperienceForm';
import CertificationsForm from './components/CertificationsForm';
import LanguagesForm from './components/LanguagesForm';

import Stepper from './components/Stepper';
import WizardNav from './components/WizardNav';

// Painel de revisão (com troca de template e geração de PDF)
import Review from './components/Review';

// Tipos do preview (inclui o union 'abnt' | 'modern')
import ResumePreview, {
  type ResumeTemplateId,
} from './components/preview/ResumePreview';

// Validadores centralizados
import {
  isNonEmpty,
  emailError,
  phoneError,
  cityStateError,
  birthDateError,
  resumoError,
} from './lib/validators';

// ---------- Tipagem util baseada em useResume ----------
type AnyState =
  ReturnType<typeof useResume> extends infer R
    ? R extends { state: infer S }
      ? S
      : never
    : never;

// ---------- Validação do passo "Dados pessoais" ----------
function validatePersonal(
  dados: AnyState extends { dados: infer D } ? D : any,
) {
  const errors: Record<string, string> = {};

  if (!isNonEmpty(dados?.nome)) errors.nome = 'Informe seu nome completo.';
  const e1 = emailError(dados?.email);
  if (e1) errors.email = e1;
  const e2 = phoneError(dados?.telefone);
  if (e2) errors.telefone = e2;
  const e3 = cityStateError(dados?.cidadePais);
  if (e3) errors.cidadePais = e3;
  const e4 = birthDateError(dados?.dataNascimento, 15, 70);
  if (e4) errors.dataNascimento = e4;
  const e5 = resumoError(dados?.resumo, 180, 600); // mínimo 180
  if (e5) errors.resumo = e5;

  return errors;
}

// ---------- Regras para "Objetivo & Formação" ----------
function canProceedObjectiveAndEducation(state: AnyState) {
  const hasObjetivo = isNonEmpty((state as any)?.dados?.objetivo);
  const edus = (state as any)?.formacoes ?? [];
  return hasObjetivo && Array.isArray(edus) && edus.length >= 1;
}

// ---------- Validação de EXPERIÊNCIA mínima (1 válida) ----------
const RE_XP_PERIOD =
  /^(0[1-9]|1[0-2])\/(\d{4})\s-\s((0[1-9]|1[0-2])\/(\d{4})|Atual)$/;

function validateExperienceItem(e: any): string[] {
  const msgs: string[] = [];
  if (!e?.empresa?.trim()) msgs.push('Empresa: informe a empresa.');
  if (!e?.cargo?.trim()) msgs.push('Cargo: informe o cargo.');
  if (!e?.periodo?.trim() || !RE_XP_PERIOD.test(e.periodo)) {
    msgs.push('Período: use "MM/AAAA - MM/AAAA" ou "MM/AAAA - Atual".');
  }
  return msgs;
}
function listExperienceIssues(state: AnyState) {
  const xs = (state as any)?.experiencias ?? [];
  const issues: { idx: number; msgs: string[] }[] = [];
  xs.forEach((e: any, i: number) => {
    const msgs = validateExperienceItem(e);
    if (msgs.length) issues.push({ idx: i, msgs });
  });
  return issues;
}

// ---------- Breakpoint helper ----------
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

  // IDs válidos definidos por ResumeTemplateId: 'abnt' | 'modern'
  const [template, setTemplate] = useState<ResumeTemplateId>('abnt');

  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // ---------- Passos & validações ----------
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
    cidadePais: 'Cidade - Estado',
    dataNascimento: 'Data de nascimento',
    email: 'E-mail',
    telefone: 'Telefone (DDI/DDD)',
    resumo: 'Resumo profissional',
    objetivo: 'Objetivo',
    site: 'Portfólio / Site',
    github: 'GitHub',
    linkedin: 'LinkedIn',
  };

  const expIssues = useMemo(() => listExperienceIssues(state as any), [state]);
  const hasAtLeastOneExp = (state.experiencias ?? []).length >= 1;
  const experiencesValid = hasAtLeastOneExp && expIssues.length === 0;

  const canNext = useMemo(() => {
    switch (step) {
      case 0:
        return !personalHasErrors;
      case 1:
        return canProceedObjectiveAndEducation(state as any);
      case 2:
        return state.skills.length >= 1;
      case 3:
        return experiencesValid;
      default:
        return true;
    }
  }, [step, state, personalHasErrors, experiencesValid]);

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

    if (step === 3 && !experiencesValid) {
      const lines = expIssues
        .map(
          (it) =>
            `• Experiência #${it.idx + 1}:\n  - ${it.msgs.join('\n  - ')}`,
        )
        .join('\n');
      alert(
        hasAtLeastOneExp
          ? `Corrija os pontos abaixo antes de continuar:\n${lines}`
          : 'Adicione pelo menos uma experiência válida para continuar.',
      );
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

  // ---------- Preview sticky (desktop) com auto-fit + zoom ----------
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

  // Nome do arquivo do PDF (limpo)
  const fileName =
    (state?.dados?.nome
      ? `Curriculo-${state.dados.nome}`.replace(/[\\/:*?"<>|]+/g, '_')
      : 'Curriculo') + '';

  // ---------- Etapa 6: revisão (com preview central) ----------
  if (step === 5) {
    return (
      <main className="page-container px-4 md:px-6 py-5">
        <Stepper steps={steps} current={step} />

        {/* Barra com troca de template e botões de PDF */}
        <div className="mt-6 flex justify-center">
          <div className="w-full max-w-[980px]">
            <Review
              template={template}
              nomeArquivo={fileName}
              onTemplateChange={setTemplate}
            />
          </div>
        </div>

        {/* ⬇ Preview centralizado (mesmo usado na coluna direita) */}
        <div className="mt-6 flex justify-center">
          <div className="w-full max-w-[980px]">
            <div className="preview-card">
              <div className="preview-body">
                <div
                  className="preview-canvas"
                  style={{ transform: 'scale(1)' }}
                >
                  {/* O template renderiza #cv-page; não crie outro wrapper. */}
                  <ResumePreview template={template} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <WizardNav
            current={step}
            total={steps.length}
            canBack={true}
            canNext={true}
            onBack={() => setStep(4)}
            onNext={handleNext}
            nextLabel="Concluir"
          />
        </div>
      </main>
    );
  }

  // ---------- Demais etapas (0..4): formulário + preview sticky ----------
  return (
    <main className="page-container px-4 md:px-6 py-5">
      <div className="layout-2col">
        {/* ESQUERDA — formulários */}
        <section>
          <Stepper steps={steps} current={step} />

          {/* Banner de erros — etapa 0 */}
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

          {/* Banner de erros — etapa 3 */}
          {step === 3 && (!hasAtLeastOneExp || expIssues.length > 0) && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <strong>Corrija as experiências abaixo:</strong>
              {!hasAtLeastOneExp ? (
                <p className="mt-2">
                  Adicione pelo menos uma experiência válida.
                </p>
              ) : (
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  {expIssues.map((it) => (
                    <li key={it.idx}>
                      <span className="font-medium">
                        Experiência #{it.idx + 1}:
                      </span>
                      <ul className="list-disc pl-5">
                        {it.msgs.map((m, k) => (
                          <li key={k}>{m}</li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}
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
              current={step}
              total={steps.length}
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
                <button
                  className="btn btn-outline"
                  onClick={() => window.print()}
                >
                  Imprimir
                </button>
                {/* PDF opcional; a etapa Revisão já oferece mais controle */}
                <button
                  className="btn btn-primary"
                  onClick={() => window.print()}
                  title="Use a etapa Revisão para gerar PDF com mais controle"
                >
                  Gerar PDF
                </button>
              </div>

              <div className="preview-body" ref={bodyRef}>
                <div
                  className="preview-canvas"
                  style={{ transform: `scale(${effectiveZoom})` }}
                >
                  {/* O template renderiza #cv-page; não criar outro wrapper. */}
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

// ---------- Provider + guard de hotkeys ----------
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
