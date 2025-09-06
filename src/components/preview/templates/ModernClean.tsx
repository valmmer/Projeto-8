// src/components/preview/templates/ModernClean.tsx
// -----------------------------------------------------------------------------
// MODERNO "CLEAN" — 2 colunas, sans-serif, hierarquia clara.
// Reutiliza os mesmos helpers de format.ts e o mesmo wrapper #cv-page/#cv-content.
// -----------------------------------------------------------------------------

import { useResume } from '../../../state';
import type { Skill } from '../../../types';
import {
  formatPeriod,
  splitBullets,
  sortByMostRecentPeriod,
  sortByYearDesc,
  rankLangLevel,
  displayLangLevel,
  sortSkills,
} from '../../../lib/format';

function keyOf(val: any, fb: string, i: number) {
  return val?.id ?? `${fb}-${i}`;
}

/* ========================= Helpers de proficiência ========================= */

// Hard skills: Básico/Intermediário/Avançado ou escala 0..5 → %
function skillLevelToPercent(nivel?: string): number {
  if (!nivel) return 0;
  const t = nivel.trim().toLowerCase();

  // Português comum
  if (t.startsWith('av')) return 100; // Avançado
  if (t.startsWith('in')) return 66; // Intermediário
  if (t.startsWith('bá') || t.startsWith('ba')) return 33; // Básico

  // Números (0..5)
  const n = Number(t.replace(',', '.'));
  if (!Number.isNaN(n) && n >= 0 && n <= 5) return Math.round((n / 5) * 100);

  return 0;
}

// Idiomas: CEFR (A1..C2) ou PT → %
function langLevelToPercent(nivel?: string): number {
  if (!nivel) return 0;
  const n = displayLangLevel(nivel); // normaliza para "A1..C2" ou "Básico/Intermediário/Avançado"
  const map: Record<string, number> = {
    A1: 15,
    A2: 30,
    B1: 50,
    B2: 70,
    C1: 85,
    C2: 100,
    Básico: 30,
    Intermediário: 60,
    Avançado: 90,
  };
  return map[n] ?? 0;
}

export default function ModernClean() {
  const { state } = useResume();
  const { dados, skills, experiencias, formacoes, certificacoes, idiomas } =
    (state as any) ?? {};

  const objetivo = dados?.objetivo?.trim();

  const contactHasAny =
    !!dados?.email?.trim() ||
    !!dados?.telefone?.trim() ||
    !!dados?.cidadePais?.trim() ||
    !!dados?.linkedin?.trim() ||
    !!dados?.github?.trim() ||
    !!dados?.site?.trim();

  const { hard: hardS, soft: softS } = sortSkills((skills as Skill[]) ?? []);

  return (
    <div
      id="cv-page"
      className="page modern"
      data-template="modern"
      lang="pt-BR"
    >
      <div id="cv-content" className="content modern-grid">
        {/* ====== HEADER (topo, ocupa largura total) ====== */}
        <header className="modern-header keep-with-next no-split">
          <div className="modern-header-inner">
            <div className="modern-head-main">
              <h1 className="modern-name">
                {dados?.nome || 'Seu Nome Completo'}
              </h1>
              {dados?.titulo?.trim() && (
                <h2 className="modern-role">{dados.titulo.trim()}</h2>
              )}
            </div>

            {dados?.foto?.trim() ? (
              <img
                src={dados.foto}
                alt={dados?.nome || 'Foto'}
                className="modern-photo"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                loading="eager"
              />
            ) : null}
          </div>
        </header>

        {/* ====== COLUNA ESQUERDA ====== */}
        <aside className="modern-col left no-split">
          {/* Contatos */}
          {contactHasAny && (
            <section className="modern-section">
              <h3 className="modern-sec">Contato</h3>
              <dl className="modern-contact">
                {dados?.email?.trim() && (
                  <div className="row">
                    <dt>E-mail</dt>
                    <dd>
                      <a
                        className="link-plain break-anywhere"
                        href={`mailto:${dados.email.trim()}`}
                      >
                        {dados.email.trim()}
                      </a>
                    </dd>
                  </div>
                )}
                {dados?.telefone?.trim() && (
                  <div className="row">
                    <dt>Telefone</dt>
                    <dd>
                      <a
                        className="link-plain"
                        href={`tel:${dados.telefone.replace(/[^\d+]/g, '')}`}
                      >
                        {dados.telefone}
                      </a>
                    </dd>
                  </div>
                )}
                {dados?.cidadePais?.trim() && (
                  <div className="row">
                    <dt>Local</dt>
                    <dd>{dados.cidadePais.trim()}</dd>
                  </div>
                )}
                {dados?.linkedin?.trim() && (
                  <div className="row">
                    <dt>LinkedIn</dt>
                    <dd>
                      <a
                        className="link-plain break-anywhere"
                        href={dados.linkedin.trim()}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {dados.linkedin.trim()}
                      </a>
                    </dd>
                  </div>
                )}
                {dados?.github?.trim() && (
                  <div className="row">
                    <dt>GitHub</dt>
                    <dd>
                      <a
                        className="link-plain break-anywhere"
                        href={dados.github.trim()}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {dados.github.trim()}
                      </a>
                    </dd>
                  </div>
                )}
                {dados?.site?.trim() && (
                  <div className="row">
                    <dt>Site</dt>
                    <dd>
                      <a
                        className="link-plain break-anywhere"
                        href={dados.site.trim()}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {dados.site.trim()}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </section>
          )}

          {/* Habilidades */}
          <section className="modern-section">
            <h3 className="modern-sec">Habilidades</h3>
            {hardS.length === 0 && softS.length === 0 ? (
              <p className="placeholder">Adicione suas habilidades…</p>
            ) : (
              <>
                {/* Hard com BARRAS */}
                {hardS.length > 0 && (
                  <>
                    <h4 className="modern-sub">Hard</h4>
                    <ul className="hard-list">
                      {hardS.map((s: any, i: number) => {
                        const pct = skillLevelToPercent(s?.nivel);
                        return (
                          <li
                            className="skillbar"
                            key={keyOf(s, `hard-${s?.nome}`, i)}
                          >
                            <div className="skillbar-row">
                              <span className="skillbar-name">{s?.nome}</span>
                              {s?.nivel ? (
                                <span className="skillbar-level">
                                  {s.nivel}
                                </span>
                              ) : null}
                            </div>
                            <div className="skillbar-track" aria-hidden="true">
                              <div
                                className="skillbar-fill"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="sr-only">
                              Proficiência em {s?.nome}:{' '}
                              {s?.nivel || 'sem nível'}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                )}

                {/* Soft como tags */}
                {softS.length > 0 && (
                  <>
                    <h4 className="modern-sub">Soft</h4>
                    <ul className="tag-list">
                      {softS.map((s: any, i: number) => (
                        <li
                          className="tag"
                          key={keyOf(s, `soft-${s?.nome}`, i)}
                        >
                          {s?.nome}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}
          </section>

          {/* Idiomas (com BARRAS) */}
          <section className="modern-section">
            <h3 className="modern-sec">Idiomas</h3>
            {Array.isArray(idiomas) && idiomas.length ? (
              <ul className="lang-list">
                {[...idiomas]
                  .sort((a: any, b: any) => {
                    const r = rankLangLevel(b?.nivel) - rankLangLevel(a?.nivel);
                    if (r !== 0) return r;
                    return (a?.idioma || '').localeCompare(
                      b?.idioma || '',
                      'pt',
                      {
                        sensitivity: 'base',
                      },
                    );
                  })
                  .map((l: any, i: number) => {
                    const levelText = l?.nivel ? displayLangLevel(l.nivel) : '';
                    const pct = langLevelToPercent(l?.nivel);
                    return (
                      <li
                        className="skillbar"
                        key={keyOf(l, `lang-${l?.idioma}`, i)}
                      >
                        <div className="skillbar-row">
                          <span className="skillbar-name">{l?.idioma}</span>
                          {levelText ? (
                            <span className="skillbar-level">{levelText}</span>
                          ) : null}
                        </div>
                        <div className="skillbar-track" aria-hidden="true">
                          <div
                            className="skillbar-fill"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="sr-only">
                          Proficiência em {l?.idioma}:{' '}
                          {levelText || 'sem nível'}
                        </span>
                      </li>
                    );
                  })}
              </ul>
            ) : (
              <p className="placeholder">Adicione seus idiomas…</p>
            )}
          </section>

          {/* Certificações */}
          <section className="modern-section">
            <h3 className="modern-sec">Certificações</h3>
            {Array.isArray(certificacoes) && certificacoes.length ? (
              <ul className="bullets">
                {sortByYearDesc(certificacoes, (c: any) => ({
                  ano: c?.ano,
                  orgao: c?.orgao,
                  titulo: c?.titulo,
                })).map((c: any, i: number) => (
                  <li key={keyOf(c, `cert-${c?.titulo}`, i)}>
                    {c?.titulo}
                    {c?.orgao ? ` — ${c.orgao}` : ''}
                    {c?.ano ? ` · ${c.ano}` : ''}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="placeholder">Adicione suas certificações…</p>
            )}
          </section>
        </aside>

        {/* ====== COLUNA DIREITA ====== */}
        <main className="modern-col right">
          {/* Resumo */}
          <section className="modern-section keep-with-next">
            <h3 className="modern-sec">Sobre</h3>
            <p>
              {dados?.resumo || (
                <span className="placeholder">
                  Adicione um resumo profissional…
                </span>
              )}
            </p>
          </section>

          {/* Objetivo (opcional) */}
          {objetivo && (
            <section className="modern-section keep-with-next">
              <h3 className="modern-sec">Objetivo</h3>
              <p>{objetivo}</p>
            </section>
          )}

          {/* Experiência */}
          <section className="modern-section keep-with-next">
            <h3 className="modern-sec">Experiência</h3>
            {Array.isArray(experiencias) && experiencias.length ? (
              <div>
                {sortByMostRecentPeriod(experiencias, (e: any) => ({
                  inicio: e?.inicio,
                  fim: e?.fim,
                  atual: e?.atual,
                })).map((e: any, i: number) => {
                  const periodo = formatPeriod({
                    periodo: e?.periodo,
                    inicio: e?.inicio,
                    fim: e?.fim,
                    atual: e?.atual,
                  });
                  const bullets = splitBullets(e?.descricao);

                  return (
                    <div
                      className="modern-entry no-split"
                      key={keyOf(e, `exp-${e?.empresa}-${e?.cargo}`, i)}
                    >
                      <div className="modern-entry-head">
                        <div className="a">
                          <strong>{e?.cargo}</strong>
                          {e?.empresa ? (
                            <>
                              {' '}
                              · <span className="muted">{e.empresa}</span>
                            </>
                          ) : null}
                        </div>
                        {periodo && <div className="b muted">{periodo}</div>}
                      </div>

                      {bullets.length >= 2 ? (
                        <ul className="bullets">
                          {bullets.map((t: string, j: number) => (
                            <li key={`exp-${i}-b-${j}`}>{t}</li>
                          ))}
                        </ul>
                      ) : (
                        e?.descricao && <p>{e.descricao}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="placeholder">Adicione suas experiências…</p>
            )}
          </section>

          {/* Formação */}
          <section className="modern-section keep-with-next">
            <h3 className="modern-sec">Formação</h3>
            {Array.isArray(formacoes) && formacoes.length ? (
              <div>
                {sortByMostRecentPeriod(formacoes, (f: any) => ({
                  inicio: f?.inicio,
                  fim: f?.fim,
                  atual: f?.atual,
                })).map((f: any, i: number) => {
                  const periodo = formatPeriod({
                    periodo: f?.periodo,
                    inicio: f?.inicio,
                    fim: f?.fim,
                    atual: f?.atual,
                  });

                  return (
                    <div
                      className="modern-entry no-split"
                      key={keyOf(f, `edu-${f?.curso}-${f?.instituicao}`, i)}
                    >
                      <div className="modern-entry-head">
                        <div className="a">
                          <strong>{f?.curso}</strong>
                          {f?.instituicao ? (
                            <>
                              {' '}
                              · <span className="muted">{f.instituicao}</span>
                            </>
                          ) : null}
                        </div>
                        {periodo && <div className="b muted">{periodo}</div>}
                      </div>
                      {f?.obs && <p>{f.obs}</p>}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="placeholder">Adicione suas formações…</p>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
