// src/components/personal/MainFields.tsx
// -------------------------------------------------------------
// Campos principais com limites e data máxima = hoje (evita futuro)
// -------------------------------------------------------------

import type { PersonalErrors } from '../../state/personal';
import type { PersonalData as Dados } from '../../types';

type Props = {
  dados: Dados;
  errors: PersonalErrors;
  submitted: boolean;
  onChange: (patch: Partial<Dados>) => void;
  inputClasses: (hasErr?: boolean) => string;
};

export default function MainFields({
  dados,
  errors,
  submitted,
  onChange,
  inputClasses,
}: Props) {
  const show = (k: keyof PersonalErrors) => submitted && !!errors[k];
  const todayIso = new Date().toISOString().split('T')[0];

  return (
    <div className="md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Nome */}
      <div className="field md:col-span-2">
        <label htmlFor="pf-nome" className="label mb-1">
          Nome completo *
        </label>
        <input
          id="pf-nome"
          className={inputClasses(show('nome'))}
          aria-invalid={show('nome')}
          value={dados.nome ?? ''}
          onChange={(e) => onChange({ nome: e.target.value })}
          autoComplete="name"
          required
          maxLength={120} // 🔒 evita nomes absurdamente longos
        />
        {show('nome') && <p className="help text-red-600">{errors.nome}</p>}
      </div>

      {/* Cidade / País */}
      <div className="field">
        <label className="label" htmlFor="pf-cidade">
          Cidade / País *
        </label>
        <input
          id="pf-cidade"
          className={inputClasses(show('cidadePais'))}
          aria-invalid={show('cidadePais')}
          value={dados.cidadePais ?? ''}
          onChange={(e) => onChange({ cidadePais: e.target.value })}
          autoComplete="address-level2"
          required
          maxLength={80} // 🔒 limita o campo
        />
        {show('cidadePais') && (
          <p className="help text-red-600">{errors.cidadePais}</p>
        )}
      </div>

      {/* Data de nascimento */}
      <div className="field">
        <label className="label" htmlFor="pf-nasc">
          Data de nascimento *
        </label>
        <input
          id="pf-nasc"
          type="date"
          className={inputClasses(show('dataNascimento'))}
          aria-invalid={show('dataNascimento')}
          value={dados.dataNascimento ?? ''}
          onChange={(e) => onChange({ dataNascimento: e.target.value })}
          autoComplete="bday"
          required
          max={todayIso} // 🔒 não permite datas futuras
        />
        {show('dataNascimento') && (
          <p className="help text-red-600">{errors.dataNascimento}</p>
        )}
      </div>
    </div>
  );
}
