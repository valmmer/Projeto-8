// src/components/personal/MainFields.tsx
// -------------------------------------------------------------
// "Cidade - Estado" com traço automático:
// • Enquanto digita: converte separadores (vírgula, /, |, travessão, "-" solto
//   ou espaço duplo no final) em " - ".
// • Ao sair do campo (onBlur): normaliza e, se ainda não houver traço mas
//   houver espaço, troca o último espaço por " - ".
// • Data de nascimento com limites (min: hoje-70, max: hoje-15) + idade auto.
// • Usa inputClasses(hasErr) para borda/anel de erro.
// -------------------------------------------------------------

import { useMemo } from 'react';
import type { PersonalErrors } from '../../state/personal';
import type { PersonalData as Dados } from '../../types';

// ---------- helpers ----------
function toIsoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function calcIdade(iso?: string): number | null {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split('-').map(Number);
  const birth = new Date(y, m - 1, d);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const mo = today.getMonth() - birth.getMonth();
  const da = today.getDate() - birth.getDate();
  if (mo < 0 || (mo === 0 && da < 0)) age--;
  return age;
}

/** Normaliza para "Cidade - Estado" (um traço com espaços). */
function normalizeCityState(s: string) {
  if (!s) return '';
  let t = s.trim();

  // converte travessões e separadores comuns em "-"
  t = t.replace(/[–—]/g, '-').replace(/[,\|/]+/g, '-');

  // padroniza espaços ao redor do traço
  t = t.replace(/\s*-\s*/g, ' - ');

  // colapsa espaços múltiplos
  t = t.replace(/\s{2,}/g, ' ').trim();

  return t;
}

/** Auto-insere " - " enquanto digita (quando o usuário coloca separador no fim). */
function autoHyphenWhileTyping(s: string) {
  if (!s) return s;

  // se terminar com separador, vira " - "
  let t = s.replace(/\s*[-,–—/|]\s*$/u, ' - ');

  // se terminar com 2+ espaços, assume que quis o traço
  t = t.replace(/\s{2,}$/, ' - ');

  // padroniza espaços ao redor de qualquer traço que tenha surgido
  t = t.replace(/\s*-\s*/g, ' - ');

  return t;
}

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
  const show = (k: keyof PersonalErrors) => Boolean(submitted && errors[k]);

  // limites do date: [hoje-70, hoje-15]
  const today = useMemo(() => new Date(), []);
  const maxBirth = useMemo(() => {
    const d = new Date(today);
    d.setFullYear(d.getFullYear() - 15);
    return toIsoDate(d);
  }, [today]);
  const minBirth = useMemo(() => {
    const d = new Date(today);
    d.setFullYear(d.getFullYear() - 70);
    return toIsoDate(d);
  }, [today]);

  const idade = useMemo(
    () => calcIdade(dados.dataNascimento),
    [dados.dataNascimento],
  );

  return (
    <div className="field grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Nome completo */}
      <div>
        <label className="label" htmlFor="pf-nome">
          Nome completo *
        </label>
        <input
          id="pf-nome"
          className={inputClasses(show('nome'))}
          placeholder="Ex.: Maria de Souza"
          value={dados.nome ?? ''}
          onChange={(e) => onChange({ nome: e.target.value })}
          autoComplete="name"
          aria-invalid={show('nome')}
          required
        />
        {show('nome') && <p className="help text-red-600">{errors.nome}</p>}
      </div>

      {/* Cidade - Estado (mantemos a mesma chave no state: `cidadePais`) */}
      <div>
        <label className="label" htmlFor="pf-cidade-estado">
          Cidade - Estado *
        </label>
        <input
          id="pf-cidade-estado"
          className={inputClasses(show('cidadePais'))}
          placeholder="Ex.: Asunción - Central  |  São Paulo - SP"
          value={dados.cidadePais ?? ''}
          onChange={(e) =>
            onChange({ cidadePais: autoHyphenWhileTyping(e.target.value) })
          }
          onBlur={(e) => {
            let v = normalizeCityState(e.target.value);

            // Se ainda não houver traço, mas há espaço, troca o último espaço por " - "
            if (v && !v.includes('-') && v.includes(' ')) {
              const i = v.lastIndexOf(' ');
              if (i > 0) v = v.slice(0, i) + ' - ' + v.slice(i + 1);
              v = normalizeCityState(v);
            }
            onChange({ cidadePais: v });
          }}
          autoComplete="address-level2"
          aria-invalid={show('cidadePais')}
          required
        />
        {show('cidadePais') ? (
          <p className="help text-red-600">{errors.cidadePais}</p>
        ) : (
          <p className="help text-slate-500">
            Formato: Cidade - Estado (traço automático).
          </p>
        )}
      </div>

      {/* Data de nascimento + Idade */}
      <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="pf-nasc">
            Data de nascimento *
          </label>
          <input
            id="pf-nasc"
            type="date"
            className={inputClasses(show('dataNascimento'))}
            value={dados.dataNascimento ?? ''}
            onChange={(e) => onChange({ dataNascimento: e.target.value })}
            autoComplete="bday"
            aria-invalid={show('dataNascimento')}
            min={minBirth}
            max={maxBirth}
            required
          />
          {show('dataNascimento') ? (
            <p className="help text-red-600">{errors.dataNascimento}</p>
          ) : (
            <p className="help text-slate-500">
              Permitido entre {minBirth} e {maxBirth}.
            </p>
          )}
        </div>

        <div className="flex items-end">
          <div className="w-full">
            <label className="label">Idade (auto)</label>
            <input
              className="input bg-slate-50"
              value={idade != null ? `${idade} anos` : '—'}
              readOnly
              aria-readonly="true"
              tabIndex={-1}
            />
            <p className="help text-slate-500">
              Calculada automaticamente a partir da data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
