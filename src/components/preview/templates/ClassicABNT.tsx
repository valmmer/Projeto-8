// src/components/preview/templates/ClassicABNT.tsx
// -----------------------------------------------------------------------------
// CLÁSSICO ABNT — 1 coluna, Times 12pt, entrelinha 1.5, recuo 1.25cm
// - Margens e tipografia vêm do CSS (.page.abnt + @page abnt).
// - Este componente organiza o conteúdo e aplica classes utilitárias.
// - O wrapper #cv-page / #cv-content é importante para impressão/export.
// - Melhorias:
//   • Mostra IDADE ao lado de Cidade/Estado no cabeçalho.
//   • Seção HABILIDADES em DUAS colunas (Hard | Soft) com grid.
// -----------------------------------------------------------------------------

import { useResume } from '../../../state';
import type { Skill } from '../../../types';

// Helpers (src/lib/format.ts)
import {
  formatPeriod,
  splitBullets,
  sortByMostRecentPeriod,
  rankLangLevel,
  displayLangLevel,
  sortByYearDesc,
  sortSkills,
} from '../../../lib/format';

// chave estável para listas (evita key duplicada quando não há id)
function keyOf(val: any, fallback: string, i: number) {
  return val?.id ?? `${fallback}-${i}`;
}

/** Converte a data e calcula idade (aceita "YYYY-MM-DD" ou "DD/MM/YYYY"). */
function calcAge(dateStr?: string | null): number | null {
  if (!dateStr) return null;

  // tenta ISO
  let y = 0,
    m = 0,
    d = 0;
  let mIso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (mIso) {
    y = +mIso[1];
    m = +mIso[2];
    d = +mIso[3];
  } else {
    // tenta BR
    const mBr = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dateStr);
    if (!mBr) return null;
    d = +mBr[1];
    m = +mBr[2];
    y = +mBr[3];
  }

  const birth = new Date(y, m - 1, d);
  if (isNaN(birth.getTime())) return null;

  const now = new Date();
  let age = now.getFullYear() - y;
  const md = now.getMonth() - (m - 1);
  if (md < 0 || (md === 0 && now.getDate() < d)) age--;
  return age >= 0 && age <= 120 ? age : null;
}

export default function ClassicABNT() {
  const { state } = useResume();
  const { dados, skills, experiencias, formacoes, certificacoes, idiomas } =
    (state as any) ?? {};

  // Campo opcional (só mostra se vier preenchido)
  const objetivo = dados?.objetivo?.trim();

  // (Compat) Linhas de contato — mantido caso precise


  // idade calculada
  const idade = calcAge(dados?.dataNascimento);

  return (
    // lang="pt-BR" ajuda a hifenização (hyphens:auto no CSS)
    <div id="cv-page" className="page abnt" data-template="abnt" lang="pt-BR">
      {/* >>> Área útil da página (margens via @page no CSS) <<< */}
      <div id="cv-content" className="content">
        {/* ======================================================================
            1) CABEÇALHO — Foto à esquerda + Nome/Contatos à direita
           ====================================================================== */}
        <header className="keep-with-next">
          <div className="abnt-row-hero">
            {/* FOTO — se não houver, mostra placeholder discreto */}
            {dados?.foto?.trim() ? (
              <img
                src={dados.foto}
                alt={dados.nome || 'Foto'}
                className="abnt-photo-left"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                loading="eager"
              />
            ) : (
              <div className="abnt-photo-left placeholder">Sem foto</div>
            )}

            {/* BLOCO DE TEXTO À DIREITA */}
            <div className="abnt-hero-text">
              {/* NOME */}
              <h1 className="abnt-headline">
                {dados?.nome || 'SEU NOME COMPLETO'}
              </h1>

              {/* TÍTULO PROFISSIONAL (opcional) */}
              {dados?.titulo?.trim() && (
                <h2 className="abnt-subheadline">{dados.titulo.trim()}</h2>
              )}

              {/* CONTATOS BÁSICOS */}
              <div className="abnt-meta">
                {dados?.email?.trim() && (
                  <p className="no-indent">
                    E-mail:{' '}
                    <a
                      href={`mailto:${dados.email.trim()}`}
                      className="link-plain break-anywhere"
                    >
                      {dados.email.trim()}
                    </a>
                  </p>
                )}
                {dados?.telefone?.trim() && (
                  <p className="no-indent">
                    Telefone:{' '}
                    <a
                      href={`tel:${dados.telefone.replace(/[^\d+]/g, '')}`}
                      className="link-plain"
                    >
                      {dados.telefone}
                    </a>
                  </p>
                )}

                {/* ✅ IDADE + CIDADE/ESTADO na MESMA LINHA */}
                {(idade != null || dados?.cidadePais?.trim()) && (
                  <p className="no-indent">
                    {idade != null ? <>Idade: {idade} anos</> : null}
                    {idade != null && dados?.cidadePais?.trim() ? ' · ' : null}
                    {dados?.cidadePais?.trim() ? (
                      <>Cidade/Estado: {dados.cidadePais.trim()}</>
                    ) : null}
                  </p>
                )}
              </div>

              {/* LINKS (abaixo) */}
              {(dados?.linkedin?.trim() ||
                dados?.github?.trim() ||
                dados?.site?.trim()) && (
                <div className="abnt-meta abnt-meta-links">
                  {dados?.linkedin?.trim() && (
                    <p className="no-indent">
                      LinkedIn:{' '}
                      <a
                        href={dados.linkedin.trim()}
                        className="link-plain break-anywhere"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {dados.linkedin.trim()}
                      </a>
                    </p>
                  )}
                  {dados?.github?.trim() && (
                    <p className="no-indent">
                      GitHub:{' '}
                      <a
                        href={dados.github.trim()}
                        className="link-plain break-anywhere"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {dados.github.trim()}
                      </a>
                    </p>
                  )}
                  {dados?.site?.trim() && (
                    <p className="no-indent">
                      Portfólio / Site:{' '}
                      <a
                        href={dados.site.trim()}
                        className="link-plain break-anywhere"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {dados.site.trim()}
                      </a>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ======================================================================
            2) RESUMO PROFISSIONAL — texto corrido
           ====================================================================== */}
        <section>
          <h3 className="sec keep-with-next">RESUMO PROFISSIONAL</h3>
          <p className="no-indent">
            {dados?.resumo || (
              <span className="placeholder">
                Adicione um resumo profissional…
              </span>
            )}
          </p>
        </section>

        {/* ======================================================================
            3) OBJETIVO PROFISSIONAL — aparece somente se existir
           ====================================================================== */}
        {objetivo && (
          <section>
            <h3 className="sec keep-with-next">OBJETIVO PROFISSIONAL</h3>
            <p className="no-indent">{objetivo}</p>
          </section>
        )}

        {/* ======================================================================
            4) EXPERIÊNCIA PROFISSIONAL
           ====================================================================== */}
        <section>
          <h3 className="sec keep-with-next">EXPERIÊNCIA PROFISSIONAL</h3>

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
                    className="entry no-split"
                    key={keyOf(e, `exp-${e?.empresa}-${e?.cargo}`, i)}
                  >
                    {/* Linha de identificação da experiência */}
                    <p className="no-indent">
                      <b>{e?.cargo}</b> — {e?.empresa}
                    </p>

                    {/* Período (opcional) */}
                    {periodo && (
                      <p className="no-indent">
                        <i>{periodo}</i>
                      </p>
                    )}

                    {/* Descrição: UL quando houver 2+ itens; senão, parágrafo */}
                    {bullets.length >= 2 ? (
                      <ul>
                        {bullets.map((t: string, j: number) => (
                          <li key={`exp-${i}-b-${j}`}>
                            <p className="no-indent">{t}</p>
                          </li>
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
            <p className="no-indent placeholder">Adicione suas experiências…</p>
          )}
        </section>

        {/* ======================================================================
            5) FORMAÇÃO ACADÊMICA
           ====================================================================== */}
        <section>
          <h3 className="sec keep-with-next">FORMAÇÃO ACADÊMICA</h3>

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
                    className="entry no-split"
                    key={keyOf(f, `edu-${f?.curso}-${f?.instituicao}`, i)}
                  >
                    <p className="no-indent">
                      <b>{f?.curso}</b> — {f?.instituicao}
                    </p>
                    {periodo && (
                      <p className="no-indent">
                        <i>{periodo}</i>
                      </p>
                    )}
                    {f?.obs && <p>{f.obs}</p>}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="no-indent placeholder">Adicione suas formações…</p>
          )}
        </section>

        {/* ======================================================================
            6) CERTIFICAÇÕES
           ====================================================================== */}
        <section>
          <h3 className="sec keep-with-next">CERTIFICAÇÕES</h3>

          {Array.isArray(certificacoes) && certificacoes.length ? (
            <ul>
              {sortByYearDesc(certificacoes, (c: any) => ({
                ano: c?.ano,
                orgao: c?.orgao,
                titulo: c?.titulo,
              })).map((c: any, i: number) => (
                <li key={keyOf(c, `cert-${c?.titulo}`, i)}>
                  <p className="no-indent">
                    {c?.titulo}
                    {c?.orgao ? ` — ${c.orgao}` : ''}
                    {c?.ano ? ` · ${c.ano}` : ''}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-indent placeholder">
              Adicione suas certificações…
            </p>
          )}
        </section>

        {/* ======================================================================
            7) HABILIDADES (Hard / Soft) — DUAS colunas
           ====================================================================== */}
        <section className="mb-4">
          <h3 className="sec keep-with-next">HABILIDADES</h3>

          {(() => {
            const { hard: hardS, soft: softS } = sortSkills(
              (skills as Skill[] | any[]) ?? [],
            );
            const hasHard = hardS.length > 0;
            const hasSoft = softS.length > 0;

            if (!hasHard && !hasSoft)
              return (
                <p className="no-indent placeholder">
                  Adicione suas habilidades…
                </p>
              );

            // ✅ grid de duas colunas — funciona na tela e na impressão
            const gridStyle: React.CSSProperties = {
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              columnGap: '18pt',
              alignItems: 'start',
            };

            return (
              <div style={gridStyle}>
                <div className="no-split keep-with-next">
                  <h4 className="sub group-title keep-with-next">
                    Hard Skills
                  </h4>
                  {hasHard ? (
                    <ul>
                      {hardS.map((s: any, i: number) => (
                        <li key={keyOf(s, `hard-${s?.nome}`, i)}>
                          <p className="no-indent">
                            {s?.nome}
                            {s?.nivel ? (
                              <>
                                {' '}
                                — <i>{s.nivel}</i>
                              </>
                            ) : null}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-indent placeholder">—</p>
                  )}
                </div>

                <div className="no-split keep-with-next">
                  <h4 className="sub group-title keep-with-next">
                    Soft Skills
                  </h4>
                  {hasSoft ? (
                    <ul>
                      {softS.map((s: any, i: number) => (
                        <li key={keyOf(s, `soft-${s?.nome}`, i)}>
                          <p className="no-indent">{s?.nome}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-indent placeholder">—</p>
                  )}
                </div>
              </div>
            );
          })()}
        </section>

        {/* ======================================================================
            8) IDIOMAS
           ====================================================================== */}
        <section>
          <h3 className="sec keep-with-next">IDIOMAS</h3>

          {Array.isArray(idiomas) && idiomas.length ? (
            <div>
              {[...idiomas]
                .sort((a: any, b: any) => {
                  const r = rankLangLevel(b?.nivel) - rankLangLevel(a?.nivel);
                  if (r !== 0) return r;
                  return (a?.idioma || '').localeCompare(
                    b?.idioma || '',
                    'pt',
                    { sensitivity: 'base' },
                  );
                })
                .map((l: any, i: number) => (
                  <div
                    className="entry no-split"
                    key={keyOf(l, `lang-${l?.idioma}`, i)}
                  >
                    <p className="no-indent">
                      {l?.idioma}
                      {l?.nivel ? (
                        <>
                          {' '}
                          — <i>{displayLangLevel(l.nivel)}</i>
                        </>
                      ) : null}
                    </p>
                  </div>
                ))}
            </div>
          ) : (
            <p className="no-indent placeholder">Adicione seus idiomas…</p>
          )}
        </section>
      </div>
    </div>
  );
}
