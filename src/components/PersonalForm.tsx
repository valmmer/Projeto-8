  // src/components/PersonalForm.tsx
  // -----------------------------------------------------------------------------
  // Objetivo deste componente:
  // • Manter seus subcomponentes (AvatarPicker / MainFields / ContactFields / SummaryField)
  // • Preservar o botão de IA do SummaryField (✨ Melhorar o resumo)
  // • Validar antes de permitir avançar (minResumo = 180, obrigatórios, formatos)
  // • Mostrar idade calculada a partir de dataNascimento (YYYY-MM-DD)
  // • Padronizar o rodapé (Anterior / Próximo) com espaçamento e acessibilidade
  // -----------------------------------------------------------------------------

  import { useCallback, useMemo, useState, type CSSProperties } from 'react';

  // Estado global do currículo (hook + dispatcher)
  import { useResume } from '../state/ResumeContext';

  // Tipos e validadores do passo pessoal
  import type { PersonalErrors } from '../state/personal';
  import { validatePersonal } from '../state/personal';

  // Utilitário simples de cálculo de idade
  import { calcIdade } from '../lib/validators';

  // Subcomponentes do teu layout atual (mantidos!)
  import AvatarPicker from './personal/AvatarPicker';
  import MainFields from './personal/MainFields';
  import ContactFields from './personal/ContactFields';
  import SummaryField from './personal/SummaryField';

  // Botão padronizado (UX consistente)
  import Button from './ui/Button';

  // Estilização do asterisco de obrigatório no cabeçalho
  const obrigatorioStyle: CSSProperties = {
    color: 'red',
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    fontWeight: 'bold',
  };

  type Props = {
    // Quando este passo é controlado “de fora” (ex.: um Wizard), o pai pode
    // ativar submitted e injetar errors. Mantemos compatibilidade.
    submitted?: boolean;
    errors?: PersonalErrors;

    // Mostra o rodapé com botões (Anterior / Próximo)
    showFooter?: boolean;

    // Callbacks de navegação (opcionalmente fornecidos pelo Wizard)
    onBack?: () => void;
    onNext?: () => void;

    // Quando o pai quiser desabilitar o botão Próximo por algum motivo externo
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

    // ========================================================================
    // 1) Estado local de "submissão" e erros — para bloquear avanço daqui
    //    (sem depender de um Wizard externo). Se o pai já passar submitted/errors,
    //    damos prioridade a eles (compat).
    // ========================================================================
    const [submittedLocal, setSubmittedLocal] = useState(false);
    const [errorsLocal, setErrorsLocal] = useState<PersonalErrors>({});

    // Decide qual conjunto usar para renderizar mensagens nos filhos
    const effectiveSubmitted = submitted || submittedLocal;
    const effectiveErrors: PersonalErrors = submitted ? errors : errorsLocal;

    // ========================================================================
    // 2) Classe base dos inputs — quando há erro, realça a borda/anel de foco
    // ========================================================================
    const inputClasses = useCallback(
      (hasErr?: boolean) =>
        `input ${hasErr ? 'border-red-500 ring-red-500/20' : ''}`,
      [],
    );

    // Helper para saber se deve mostrar a mensagem de um campo
    const show = (k: keyof PersonalErrors) =>
      Boolean(effectiveSubmitted && effectiveErrors[k]);

    // ========================================================================
    // 3) Idade calculada a partir de dataNascimento (YYYY-MM-DD)
    //    Apenas exibição informativa; a regra de idade mínima/máxima
    //    continua a cargo do validatePersonal (state/personal.ts).
    // ========================================================================
    const idade = useMemo(
      () => calcIdade(state.dados.dataNascimento),
      [state.dados.dataNascimento],
    );

    // ========================================================================
    // 4) Avançar — valida localmente e só chama onNext() se estiver tudo OK
    //    Usa as mesmas regras centrais do projeto (validatePersonal).
    // ========================================================================
    function handleNextClick() {
      // Se o botão já veio desabilitado pelo pai, não faz nada.
      if (nextDisabled) return;

      // Validação central do passo pessoal (minResumo=180 por padrão, etc.)
      // Personalize aqui se quiser afrouxar algo:
      //   ex.: requireCidadePais: false, minAge: 14, maxAge: 75
      const e = validatePersonal(state.dados, {
        // requireCidadePais: false,
      });

      setErrorsLocal(e);
      setSubmittedLocal(true);

      // Nenhum erro → pode seguir para o próximo passo
      if (Object.keys(e).length === 0) onNext?.();
    }

    // ========================================================================
    // Render
    // ========================================================================
    return (
      <section className="section" aria-labelledby="pf-title">
        {/* Cabeçalho da seção */}
        <div className="section-head">
          <h2 id="pf-title" className="section-title">
            Dados Pessoais
          </h2>
          <span className="section-note" style={obrigatorioStyle}>
            * Campos Obrigatórios
          </span>
        </div>

        {/* Cartão principal do passo */}
        <div className="card">
          {/* Topo do cartão — instrução + idade (se houver data válida) */}
          <div className="card-header">
            <p className="text-sm text-slate-600">
              Preencha seus dados com atenção. O PDF final segue padrão ABNT.
            </p>
            {typeof idade === 'number' && (
              <p className="text-xs text-slate-500 mt-1">
                Idade calculada: <strong>{idade}</strong> anos
              </p>
            )}
          </div>

          {/* Corpo do cartão: colunas (avatar | formulários) */}
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Coluna esquerda — Avatar */}
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

              {/* Coluna direita — Campos principais, contatos e resumo (com IA) */}
              <div className="md:col-span-9 space-y-6">
                {/* NOME + DATA NASC + etc (subcomponente teu) */}
                <MainFields
                  dados={state.dados}
                  errors={effectiveErrors}
                  submitted={effectiveSubmitted}
                  inputClasses={inputClasses}
                  onChange={(patch) =>
                    dispatch({ type: 'SET_DADOS', payload: patch })
                  }
                />

                {/* CONTATOS (email/telefone/linkedin/github/site) */}
                <ContactFields
                  dados={state.dados}
                  errors={effectiveErrors}
                  submitted={effectiveSubmitted}
                  inputClasses={inputClasses}
                  onChange={(patch) =>
                    dispatch({ type: 'SET_DADOS', payload: patch })
                  }
                />

                {/* RESUMO PROFISSIONAL + IA (ImproveButton) */}
                {/* SummaryField já implementa contador, limites e o botão ✨ */}
                <SummaryField
                  value={state.dados.resumo ?? ''}
                  hasError={show('resumo')}
                  errorText={effectiveErrors.resumo || undefined}
                  onChange={(text) =>
                    dispatch({ type: 'SET_DADOS', payload: { resumo: text } })
                  }
                  minLen={180} // ✅ mínimo solicitado
                  maxLen={600}
                  submitted={effectiveSubmitted}
                />
              </div>
            </div>
          </div>

          {/* Rodapé do cartão com UX de botões padronizados */}
          {showFooter && (
            <div className="card-footer flex items-center justify-between gap-3 pt-4">
              {/* Botão Anterior (secundário) */}
              <Button
                variant="secondary"
                onClick={onBack ?? (() => window.history.back())}
              >
                Anterior
              </Button>

              {/* À direita mantemos o Próximo. Você pode incluir aqui um progresso. */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleNextClick}
                  disabled={Boolean(nextDisabled)}
                >
                  Próximo
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }
