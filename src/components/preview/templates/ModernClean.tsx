// Modern Clean — títulos com cor, layout claro, listas consistentes.
// Root continua sendo <article className="page template-modern abnt"> se quiser
// manter tipografia ABNT; se preferir Inter sem recuo, remova "abnt" do root.

import { useResume } from '../../../state';

function keyOf(val: any, fallback: string, i: number) {
  return val?.id ?? `${fallback}-${i}`;
}

export default function ModernClean() {
  const { state } = useResume();
  const { dados, skills, experiencias, formacoes, certificacoes, idiomas } =
    state;

  const soft = skills.filter((s: any) => s.tipo === 'Soft');
  const hard = skills.filter((s: any) => s.tipo !== 'Soft');

  const contactLines = [
    dados.email?.trim() ? `E-mail: ${dados.email.trim()}` : null,
    dados.telefone?.trim() ? `Telefone: ${dados.telefone.trim()}` : null,
    dados.linkedin?.trim() ? `LinkedIn: ${dados.linkedin.trim()}` : null,
    (dados as any)?.github?.trim()
      ? `GitHub: ${(dados as any).github.trim()}`
      : null,
    dados.site?.trim() ? `Site/Portfólio: ${dados.site.trim()}` : null,
    dados.cidadePais?.trim() ? `Cidade/País: ${dados.cidadePais.trim()}` : null,
  ].filter(Boolean) as string[];

  return (
    // Se quiser manter regras ABNT (recuo/justify), mantenha "abnt" aqui.
    // Se preferir um Modern sem recuo nos parágrafos, remova "abnt" e ajuste CSS.
    <article className="page template-modern abnt text-black leading-relaxed">
      <header className="mb-6 keep-with-next">
        <div className="header-grid">
          {dados.foto?.trim() ? (
            <img
              src={dados.foto}
              alt={dados.nome || 'Foto'}
              className="photo"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              loading="eager"
            />
          ) : (
            <div
              className="photo grid place-items-center text-slate-500 text-xs"
              style={{
                width: '32mm',
                height: '32mm',
                border: '0.5pt solid #cbd5e1',
                borderRadius: '2mm',
              }}
            >
              Sem foto
            </div>
          )}

          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {dados.nome || 'Seu Nome'}
            </h1>
            <div className="contact-lines mt-1 break-words">
              {[
                dados.email?.trim() ? `E-mail: ${dados.email.trim()}` : null,
                dados.telefone?.trim()
                  ? `Telefone: ${dados.telefone.trim()}`
                  : null,
                dados.linkedin?.trim()
                  ? `LinkedIn: ${dados.linkedin.trim()}`
                  : null,
                (dados as any)?.github?.trim()
                  ? `GitHub: ${(dados as any).github.trim()}`
                  : null,
                dados.site?.trim()
                  ? `Site/Portfólio: ${dados.site.trim()}`
                  : null,
                dados.cidadePais?.trim()
                  ? `Cidade/País: ${dados.cidadePais.trim()}`
                  : null,
              ]
                .filter(Boolean)
                .map((line, i) => (
                  <p key={`contact-${i}`} className="no-indent">
                    {line}
                  </p>
                ))}
            </div>
          </div>
        </div>
        <div className="h-[2px] bg-brand-500 mt-4" />
      </header>

      {(dados as any)?.objetivo?.trim() && (
        <Section title="Objetivo">
          <p className="text-justify">{(dados as any).objetivo}</p>
        </Section>
      )}

      <Section title="Resumo">
        <p className="text-justify">
          {dados.resumo || 'Adicione um resumo profissional...'}
        </p>
      </Section>

      <Section title="Formação Acadêmica">
        {formacoes.length ? (
          <div className="mt-1">
            {formacoes.map((f, i) => (
              <div
                className="entry no-split"
                key={keyOf(f, `edu-${f.curso}-${f.instituicao}`, i)}
              >
                <p className="no-indent">
                  <b>{f.curso}</b> — {f.instituicao}
                  {f.periodo ? ` · ${f.periodo}` : ''}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-indent">Adicione suas formações…</p>
        )}
      </Section>

      <Section title="Habilidades">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-1 no-indent">
              Hard Skills
            </h4>
            {hard.length ? (
              <ul className="list-disc pl-6">
                {hard.map((s: any, i: number) => (
                  <li key={keyOf(s, `skill-${s.nome}`, i)}>
                    <p className="no-indent">
                      {s.nome}
                      {s.nivel ? (
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
              <p className="text-slate-500 no-indent">—</p>
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-1 no-indent">
              Soft Skills
            </h4>
            {soft.length ? (
              <ul className="list-disc pl-6">
                {soft.map((s: any, i: number) => (
                  <li key={keyOf(s, `soft-${s.nome}`, i)}>
                    <p className="no-indent">{s.nome}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 no-indent">—</p>
            )}
          </div>
        </div>
      </Section>

      <Section title="Experiência Profissional">
        {experiencias.length ? (
          <div className="mt-1">
            {experiencias.map((e, i) => (
              <div
                className="entry no-split"
                key={keyOf(e, `exp-${e.empresa}-${e.cargo}`, i)}
              >
                <p className="no-indent font-bold">
                  {e.cargo} — {e.empresa}
                </p>
                <p className="no-indent italic">
                  {e.periodo}
                  {e.atual ? ' (atual)' : ''}
                </p>
                <p>{e.descricao}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-indent">Adicione suas experiências…</p>
        )}
      </Section>

      <Section title="Certificações">
        {certificacoes.length ? (
          <div className="mt-1">
            {certificacoes.map((c, i) => (
              <div
                className="entry no-split"
                key={keyOf(c, `cert-${c.titulo}`, i)}
              >
                <p className="no-indent">
                  {c.titulo}
                  {c.orgao ? ` — ${c.orgao}` : ''}
                  {c.ano ? ` · ${c.ano}` : ''}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-indent">Adicione suas certificações…</p>
        )}
      </Section>

      <Section title="Idiomas">
        {idiomas.length ? (
          <div className="mt-1">
            {idiomas.map((l, i) => (
              <div
                className="entry no-split"
                key={keyOf(l, `lang-${l.idioma}`, i)}
              >
                <p className="no-indent">
                  {l.idioma} — <i>{l.nivel}</i>
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-indent">Adicione seus idiomas…</p>
        )}
      </Section>
    </article>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-4 keep-with-next">
      <h3 className="text-lg font-semibold text-brand-700 no-indent">
        {title}
      </h3>
      <div className="mt-1">{children}</div>
    </section>
  );
}
