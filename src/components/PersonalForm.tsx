// src/components/PersonalForm.tsx
// -----------------------------------------------------------------------------
// • Imports corrigidos: subcomponentes em "./personal/..."
// • Hook do contexto vindo de "../state/ResumeContext"
// • Resumo profissional com min=180 / max=600 caracteres
// -----------------------------------------------------------------------------

import { useCallback, useState, type CSSProperties } from 'react';
import { useResume } from '../state/ResumeContext';
import type { PersonalErrors } from '../state/personal';

// filhos ficam dentro de ./personal
import AvatarPicker from './personal/AvatarPicker';
import MainFields from './personal/MainFields';
import ContactFields from './personal/ContactFields';
import SummaryField from './personal/SummaryField';

const obrigatorioStyle: CSSProperties = {
  color: 'red',
  fontFamily: 'Arial, sans-serif',
  fontSize: '14px',
  fontWeight: 'bold',
};

type Props = {
  submitted?: boolean;
  errors?: PersonalErrors;
  showFooter?: boolean;
  onBack?: () => void;
  onNext?: () => void;
  nextDisabled?: boolean;
};

export default function PersonalForm({
  submitted = false,
  errors = {} as PersonalErrors,
  showFooter = false,
  onBack,
  onNext,
  nextDisabled,
}: Props) {
  const { state, dispatch } = useResume();
  const [fotoErro, setFotoErro] = useState<string>('');

  // classe base de inputs; em erro, realça borda, sem conflitar com :focus
  const inputClasses = useCallback(
    (hasErr?: boolean) =>
      `input ${hasErr ? 'border-red-500 ring-red-500/20' : ''}`,
    [],
  );

  const show = (k: keyof PersonalErrors) => Boolean(submitted && errors[k]);

  return (
    <section className="section" aria-labelledby="pf-title">
      <div className="section-head">
        <h2 id="pf-title" className="section-title">
          Dados Pessoais
        </h2>
        <span className="section-note" style={obrigatorioStyle}>
          * Campos Obrigatórios
        </span>
      </div>

      <div className="card">
        <div className="card-header">
          <p className="text-sm text-slate-600">
            Preencha seus dados com atenção. O PDF final segue padrão ABNT.
          </p>
        </div>

        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Avatar */}
            <aside className="md:col-span-3">
              <AvatarPicker
                foto={state.dados.foto}
                erro={fotoErro}
                setErro={setFotoErro}
                onChangeUrl={(url) =>
                  dispatch({ type: 'SET_DADOS', payload: { foto: url } })
                }
                onClear={() =>
                  dispatch({ type: 'SET_DADOS', payload: { foto: '' } })
                }
              />
            </aside>

            {/* Campos principais, contatos e resumo */}
            <div className="md:col-span-9 space-y-6">
              <MainFields
                dados={state.dados}
                errors={errors}
                submitted={submitted}
                inputClasses={inputClasses}
                onChange={(patch) =>
                  dispatch({ type: 'SET_DADOS', payload: patch })
                }
              />

              <ContactFields
                dados={state.dados}
                errors={errors}
                submitted={submitted}
                inputClasses={inputClasses}
                onChange={(patch) =>
                  dispatch({ type: 'SET_DADOS', payload: patch })
                }
              />

              {/* Resumo com limites rígidos (min 180 / max 600) */}
              <SummaryField
                value={state.dados.resumo ?? ''}
                hasError={show('resumo')}
                errorText={errors.resumo || undefined}
                onChange={(text) =>
                  dispatch({ type: 'SET_DADOS', payload: { resumo: text } })
                }
                minLen={180}
                maxLen={600}
                submitted={submitted}
              />
            </div>
          </div>
        </div>

        {showFooter && (
          <div className="card-footer">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onBack ?? (() => window.history.back())}
            >
              Voltar
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={Boolean(nextDisabled)}
              onClick={onNext ?? (() => {})}
            >
              Próximo
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
