// Clássico ABNT — uma coluna, tipografia neutra, seções claras.
// Requer: root <article className="page abnt"> no ResumePreview.
// Usa .entry.no-split para cada item, e .keep-with-next nos títulos.

import { useResume } from '../../../state';
import type { Skill } from '../../../types';

type SkillLevel = 'Básico' | 'Intermediário' | 'Avançado';
const LEVEL_ORDER: Record<SkillLevel, number> = {
  Avançado: 0,
  Intermediário: 1,
  Básico: 2,
};

// helper p/ chaves estáveis
function keyOf(val: any, fallback: string, i: number) {
  return val?.id ?? `${fallback}-${i}`;
}

export default function ClassicABNT() {
  const { state } = useResume();
  const { dados, skills, experiencias, formacoes, certificacoes, idiomas } =
    state;

  const objetivo = (dados as any)?.objetivo?.trim();

  const contactLines = [
    dados.email?.trim() ? `E-mail: ${dados.email.trim()}` : null,
    dados.telefone?.trim() ? `Telefone: ${dados.telefone.trim()}` : null,
    dados.linkedin?.trim() ? `LinkedIn: ${dados.linkedin.trim()}` : null,
    (dados as any)?.github?.trim()
      ? `GitHub: ${(dados as any).github.trim()}`
      : null,
    dados.site?.trim() ? `Site/Portfólio: ${dados.site.trim()}` : null,
    dados.cidadePais?.trim() ? `Cidade/País: ${dados.cidadePais.trim()}` : null,
    (dados as any)?.dataNascimento?.trim()
      ? `Nascimento: ${(dados as any).dataNascimento.trim()}`
      : null,
  ].filter(Boolean) as string[];

  // Ordena e separa Hard/Soft (fallback: sem tipo => Hard)
  const sorted = [...skills].sort((a: any, b: any) => {
    const byType = (a.tipo === 'Soft' ? 1 : 0) - (b.tipo === 'Soft' ? 1 : 0);
    if (byType !== 0) return byType;
    const byLvl = (LEVEL_ORDER as any)[a.nivel] - (LEVEL_ORDER as any)[b.nivel];
    if (byLvl !== 0) return byLvl;
    return a.nome.localeCompare(b.nome, 'pt', { sensitivity: 'base' });
  });
  const hard = sorted.filter((s: any) => s.tipo !== 'Soft');
  const soft = sorted.filter((s: any) => s.tipo === 'Soft');

  const SkillList = ({ items }: { items: Skill[] }) =>
    items.length ? (
      <ul className="list-disc pl-6 mt-1">
        {items.map((s, i) => (
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
      <p className="text-sm text-slate-500 mt-1 no-indent">—</p>
    );

  return (
    <article className="page abnt text-black leading-relaxed">
      {/* Cabeçalho */}
      <header className="mb-5 keep-with-next">
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
            <h1 className="font-extrabold uppercase tracking-wide">
              Curriculum Vitae
            </h1>
            <h2 className="font-semibold mt-1 text-lg">
              {dados.nome || 'Seu Nome'}
            </h2>

            {/* 1 info por linha; sem recuo; quebra URLs longas */}
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
                (dados as any)?.dataNascimento?.trim()
                  ? `Nascimento: ${(dados as any).dataNascimento.trim()}`
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
        <hr className="mt-3" />
      </header>

      {objetivo && (
        <section className="mb-4 keep-with-next">
          <h3 className="sec">OBJETIVO PROFISSIONAL</h3>
          <p className="mt-1">{objetivo}</p>
        </section>
      )}

      <section className="mb-4 keep-with-next">
        <h3 className="sec">RESUMO PROFISSIONAL</h3>
        <p className="mt-1">
          {dados.resumo || 'Adicione um resumo profissional...'}
        </p>
      </section>

      <section className="mb-4 keep-with-next">
        <h3 className="sec">FORMAÇÃO ACADÊMICA</h3>
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
          <p className="mt-1 no-indent">Adicione suas formações…</p>
        )}
      </section>

      <section className="mb-4 keep-with-next">
        <h3 className="sec">HABILIDADES</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <h4 className="sub">Hard Skills</h4>
            <SkillList items={hard as any} />
          </div>
          <div>
            <h4 className="sub">Soft Skills</h4>
            <ul className="list-disc pl-6 mt-1">
              {(soft as any[]).length ? (
                soft.map((s, i) => (
                  <li key={keyOf(s, `soft-${s.nome}`, i)}>
                    <p className="no-indent">{s.nome}</p>
                  </li>
                ))
              ) : (
                <li className="text-slate-500">
                  <p className="no-indent">—</p>
                </li>
              )}
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-4 keep-with-next">
        <h3 className="sec">EXPERIÊNCIA PROFISSIONAL</h3>
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
                {/* descrição pode conter bullets (•); se quiser, já deixe como <ul><li> no form */}
                <p>{e.descricao}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-1 no-indent">Adicione suas experiências…</p>
        )}
      </section>

      <section className="mb-4 keep-with-next">
        <h3 className="sec">CERTIFICAÇÕES</h3>
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
          <p className="mt-1 no-indent">Adicione suas certificações…</p>
        )}
      </section>

      <section className="keep-with-next">
        <h3 className="sec">IDIOMAS</h3>
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
          <p className="mt-1 no-indent">Adicione seus idiomas…</p>
        )}
      </section>
    </article>
  );
}
