// src/components/personal/ContactFields.tsx
// -------------------------------------------------------------
// Contatos + normalizadores em onBlur para LinkedIn/GitHub/Site
// -------------------------------------------------------------

import { memo } from 'react';
import type { PersonalData } from '../../types';
import type { PersonalErrors } from '../../state/personal';

type Props = {
  dados: PersonalData;
  errors?: PersonalErrors;
  submitted?: boolean;
  inputClasses: (hasErr?: boolean) => string;
  onChange: (patch: Partial<PersonalData>) => void;
};

function sanitizePhone(raw: string) {
  const cleaned = raw
    .replace(/[^\d()+\-\s]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return cleaned.replace(/(?!^)\+/g, '');
}

// completa http(s)://; mapeia username -> URL canônica
function normalizeUrl(
  kind: 'linkedin' | 'github' | 'site',
  raw: string,
): string {
  const v = (raw || '').trim();
  if (!v) return '';

  // já tem protocolo?
  const hasProto = /^(https?:)?\/\//i.test(v);
  const val = hasProto ? v : `https://${v.replace(/^\/+/, '')}`;

  if (kind === 'linkedin') {
    // aceita "usuario" ou "/in/usuario" e normaliza
    const username = v
      .replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, '')
      .replace(/^@/, '')
      .replace(/^\//, '');
    if (!/linkedin\.com/i.test(v)) {
      return `https://www.linkedin.com/in/${username}`;
    }
  }

  if (kind === 'github') {
    const username = v
      .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
      .replace(/^@/, '')
      .replace(/^\//, '');
    if (!/github\.com/i.test(v)) {
      return `https://github.com/${username}`;
    }
  }

  return val;
}

function ContactFieldsImpl({
  dados,
  errors = {},
  submitted = false,
  inputClasses,
  onChange,
}: Props) {
  const show = (k: keyof PersonalErrors) => Boolean(submitted && errors[k]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
      {/* Email */}
      <div className="md:col-span-6 field">
        <label className="label" htmlFor="pf-email">
          Email *
        </label>
        <input
          id="pf-email"
          className={inputClasses(show('email'))}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          value={dados.email}
          onChange={(e) => onChange({ email: e.target.value.trimStart() })}
          aria-invalid={show('email') || undefined}
          aria-describedby="pf-email-help"
          required
        />
        <p id="pf-email-help" className="help">
          Informe um email válido.
        </p>
      </div>

      {/* Telefone */}
      <div className="md:col-span-6 field">
        <label className="label" htmlFor="pf-tel">
          Telefone (DDD/DDI) *
        </label>
        <input
          id="pf-tel"
          className={inputClasses(show('telefone'))}
          inputMode="tel"
          autoComplete="tel"
          placeholder="+55 11 99999-9999"
          value={dados.telefone}
          onChange={(e) =>
            onChange({ telefone: sanitizePhone(e.target.value) })
          }
          aria-invalid={show('telefone') || undefined}
          aria-describedby="pf-tel-help"
          required
        />
        <p id="pf-tel-help" className="help">
          Aceita +, (), -, espaço e dígitos.
        </p>
      </div>

      {/* LinkedIn */}
      <div className="md:col-span-6 field">
        <label className="label" htmlFor="pf-linkedin">
          LinkedIn
        </label>
        <input
          id="pf-linkedin"
          className="input"
          inputMode="url"
          autoComplete="url"
          placeholder="https://linkedin.com/in/seu-perfil"
          value={dados.linkedin ?? ''}
          onChange={(e) => onChange({ linkedin: e.target.value })}
          onBlur={(e) =>
            onChange({ linkedin: normalizeUrl('linkedin', e.target.value) })
          }
        />
      </div>

      {/* GitHub */}
      <div className="md:col-span-6 field">
        <label className="label" htmlFor="pf-github">
          GitHub
        </label>
        <input
          id="pf-github"
          className="input"
          inputMode="url"
          autoComplete="url"
          placeholder="https://github.com/usuario"
          value={dados.github ?? ''}
          onChange={(e) => onChange({ github: e.target.value })}
          onBlur={(e) =>
            onChange({ github: normalizeUrl('github', e.target.value) })
          }
        />
      </div>

      {/* Site */}
      <div className="md:col-span-12 field">
        <label className="label" htmlFor="pf-site">
          Portfólio / Site
        </label>
        <input
          id="pf-site"
          className="input"
          inputMode="url"
          autoComplete="url"
          placeholder="https://meusite.com"
          value={dados.site ?? ''}
          onChange={(e) => onChange({ site: e.target.value })}
          onBlur={(e) =>
            onChange({ site: normalizeUrl('site', e.target.value) })
          }
        />
      </div>
    </div>
  );
}

export default memo(ContactFieldsImpl);
