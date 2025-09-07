// src/components/personal/ContactFields.tsx
// -------------------------------------------------------------
// Contatos com:
// • validação visual (inputClasses + submitted/errors)
// • normalização no onBlur:
//    - email em minúsculas e trim
//    - telefone com limpeza + formatação leve (+CC grupos)
//    - urls com https:// e domínios esperados (linkedin.com / github.com)
// • microcopy clara nos placeholders e dicas
// -------------------------------------------------------------

import React from 'react';
import type { PersonalErrors } from '../../state/personal';
import type { PersonalData as Dados } from '../../types';

type Props = {
  dados: Dados;
  errors: PersonalErrors;
  submitted: boolean;
  onChange: (patch: Partial<Dados>) => void;
  inputClasses: (hasErr?: boolean) => string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

function normalizeEmail(v: string) {
  return (v || '').trim().toLowerCase();
}

/** Mantém + e dígitos; adiciona espaçamento leve p/ leitura. */
function normalizePhone(raw: string) {
  if (!raw) return '';
  const trimmed = raw.trim();

  // mantém sinal de + só se vier no começo
  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/[^\d]/g, '');
  let out = hasPlus ? '+' + digits : digits;

  // formatação leve (heurística): +595 981 123 456 / 11 98765 4321 / etc.
  if (out.startsWith('+')) {
    // split em blocos ~3-3-3-4
    out = out.replace(
      /^\+(\d{1,3})(\d{2,4})?(\d{3,4})?(\d{3,4})?(\d+)?$/,
      (_m, c, a = '', b = '', d = '', e = '') =>
        ['+' + c, a, b, d, e].filter(Boolean).join(' '),
    );
  } else {
    // sem DDI, só agrupa um pouco: 2-4-4-4
    out = out.replace(
      /^(\d{2})(\d{4})?(\d{4})?(\d+)?$/,
      (_m, a, b = '', c = '', d = '') => [a, b, c, d].filter(Boolean).join(' '),
    );
  }

  return out.trim();
}

function ensureHttp(url: string) {
  if (!url) return '';
  const u = url.trim();
  if (/^https?:\/\//i.test(u)) return u;
  return 'https://' + u.replace(/^\/+/, '');
}

function normalizeLinkedIn(url: string) {
  if (!url) return '';
  let u = ensureHttp(url);
  // força domínio linkedin.com (sem quebrar subpaths)
  u = u.replace(
    /https?:\/\/(www\.)?linkedin\.[^/]+/i,
    'https://www.linkedin.com',
  );
  return u;
}

function normalizeGitHub(url: string) {
  if (!url) return '';
  let u = ensureHttp(url);
  u = u.replace(/https?:\/\/(www\.)?github\.[^/]+/i, 'https://github.com');
  return u;
}

export default function ContactFields({
  dados,
  errors,
  submitted,
  onChange,
  inputClasses,
}: Props) {
  const show = (k: keyof PersonalErrors) => Boolean(submitted && errors[k]);

  return (
    <div className="field grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* E-mail */}
      <div>
        <label className="label" htmlFor="pf-email">
          E-mail *
        </label>
        <input
          id="pf-email"
          type="email"
          inputMode="email"
          className={inputClasses(show('email'))}
          placeholder="voce@exemplo.com"
          value={dados.email ?? ''}
          onChange={(e) => onChange({ email: e.target.value })}
          onBlur={(e) => {
            const v = normalizeEmail(e.target.value);
            onChange({ email: v });
          }}
          aria-invalid={show('email')}
          required
        />
        {show('email') ? (
          <p className="help text-red-600">{errors.email}</p>
        ) : (
          <p className="help text-slate-500">
            Use um e-mail ativo. Ex.: nome.sobrenome@provedor.com
          </p>
        )}
      </div>

      {/* Telefone */}
      <div>
        <label className="label" htmlFor="pf-tel">
          Telefone (DDI/DDD) *
        </label>
        <input
          id="pf-tel"
          inputMode="tel"
          className={inputClasses(show('telefone'))}
          placeholder="+595 981 000 000"
          value={dados.telefone ?? ''}
          onChange={(e) => onChange({ telefone: e.target.value })}
          onBlur={(e) => onChange({ telefone: normalizePhone(e.target.value) })}
          aria-invalid={show('telefone')}
          required
        />
        {show('telefone') ? (
          <p className="help text-red-600">{errors.telefone}</p>
        ) : (
          <p className="help text-slate-500">
            Inclua DDI (ex.: <span className="font-mono">+595</span>) quando
            possível.
          </p>
        )}
      </div>

      {/* LinkedIn */}
      <div>
        <label className="label" htmlFor="pf-linkedin">
          LinkedIn (opcional)
        </label>
        <input
          id="pf-linkedin"
          className={inputClasses(show('linkedin'))}
          placeholder="https://www.linkedin.com/in/seu-perfil"
          value={dados.linkedin ?? ''}
          onChange={(e) => onChange({ linkedin: e.target.value })}
          onBlur={(e) =>
            onChange({ linkedin: normalizeLinkedIn(e.target.value) })
          }
          aria-invalid={show('linkedin')}
        />
        {show('linkedin') ? (
          <p className="help text-red-600">{errors.linkedin}</p>
        ) : (
          <p className="help text-slate-500">
            Cole seu link público do LinkedIn.
          </p>
        )}
      </div>

      {/* GitHub */}
      <div>
        <label className="label" htmlFor="pf-github">
          GitHub (opcional)
        </label>
        <input
          id="pf-github"
          className={inputClasses(show('github'))}
          placeholder="https://github.com/seu-usuario"
          value={dados.github ?? ''}
          onChange={(e) => onChange({ github: e.target.value })}
          onBlur={(e) => onChange({ github: normalizeGitHub(e.target.value) })}
          aria-invalid={show('github')}
        />
        {show('github') ? (
          <p className="help text-red-600">{errors.github}</p>
        ) : (
          <p className="help text-slate-500">
            Informe seu usuário ou repositório principal.
          </p>
        )}
      </div>

      {/* Site / Portfólio */}
      <div className="md:col-span-2">
        <label className="label" htmlFor="pf-site">
          Portfólio / Site (opcional)
        </label>
        <input
          id="pf-site"
          className={inputClasses(show('site'))}
          placeholder="https://seu-site.com"
          value={dados.site ?? ''}
          onChange={(e) => onChange({ site: e.target.value })}
          onBlur={(e) => onChange({ site: ensureHttp(e.target.value) })}
          aria-invalid={show('site')}
        />
        {show('site') ? (
          <p className="help text-red-600">{errors.site}</p>
        ) : (
          <p className="help text-slate-500">
            Adiciona credibilidade (projetos, cases, etc.).
          </p>
        )}
      </div>
    </div>
  );
}
