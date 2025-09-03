import { useResume } from '../state/ResumeContext';

export default function Preview() {
  const { state } = useResume();
  const { dados, skills, experiencias, formacoes, certificacoes, idiomas } =
    state;

  // 'objetivo' pode não existir no tipo PersonalData -> acesso seguro
  const objetivo: string | undefined = (dados as Record<string, any>)?.objetivo;

  // numeração dinâmica das seções
  const base = objetivo ? 2 : 1;
  const nResumo = objetivo ? '2.' : '1.';
  const nFormacao = `${base}.`;
  const nHabs = `${base + 1}.`;
  const nExp = `${base + 2}.`;
  const nCert = `${base + 3}.`;
  const nIdiomas = `${base + 4}.`;

  return (
    <article className="max-w-3xl mx-auto text-black font-serif leading-relaxed">
      {/* Cabeçalho */}
      <header className="mb-6">
        <div className="flex items-center gap-4">
          {dados.foto && (
            <img
              src={dados.foto}
              alt={dados.nome || 'Foto'}
              className="w-20 h-20 rounded-full object-cover border"
            />
          )}
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-extrabold tracking-wide uppercase">
              Curriculum Vitae
            </h1>
            <h2 className="text-xl font-semibold mt-1">
              {dados.nome || 'Seu Nome'}
            </h2>
            <p className="text-sm">
              {dados.email || 'email'} · {dados.telefone || 'telefone'} ·{' '}
              {dados.linkedin || 'linkedin'}
              {dados.cidadePais ? ` · ${dados.cidadePais}` : ''}
              {(dados as any)?.dataNascimento
                ? ` · Nasc.: ${(dados as any).dataNascimento}`
                : ''}
            </p>
            {(dados as any)?.github || (dados as any)?.site ? (
              <p className="text-sm">
                {(dados as any)?.github
                  ? `GitHub: ${(dados as any).github}`
                  : ''}
                {(dados as any)?.github && (dados as any)?.site ? ' · ' : ''}
                {(dados as any)?.site ? `Site: ${(dados as any).site}` : ''}
              </p>
            ) : null}
          </div>
        </div>
        <hr className="mt-4" />
      </header>

      {/* 1. Objetivo (opcional) */}
      {objetivo?.trim() ? (
        <section className="mb-6">
          <h3 className="font-bold text-lg mb-2">1. Objetivo Profissional</h3>
          <p className="text-justify">{objetivo}</p>
        </section>
      ) : null}

      {/* Resumo */}
      <section className="mb-6">
        <h3 className="font-bold text-lg mb-2">
          {nResumo} Resumo Profissional
        </h3>
        <p className="whitespace-pre-line break-words leading-relaxed text-justify [text-align-last:start]">
          {dados.resumo || 'Escreva aqui um breve resumo profissional…'}
        </p>
      </section>

      {/* Formação */}
      <section className="mb-6">
        <h3 className="font-bold text-lg mb-2">
          {nFormacao} Formação Acadêmica
        </h3>
        {formacoes.length ? (
          <ul className="list-disc pl-6">
            {formacoes.map((f) => (
              <li key={f.id}>
                <span className="font-medium">{f.curso}</span> — {f.instituicao}
                {f.periodo ? ` (${f.periodo})` : ''}
              </li>
            ))}
          </ul>
        ) : (
          <p className="whitespace-pre-line break-words leading-relaxed text-justify [text-align-last:start]">Adicione suas formações…</p>
        )}
      </section>

      {/* Habilidades */}
      <section className="mb-6">
        <h3 className="whitespace-pre-line break-words leading-relaxed text-justify [text-align-last:start]">{nHabs} Habilidades</h3>
        {skills.length ? (
          <ul className="list-disc pl-6">
            {skills.map((s) => (
              <li key={s.id}>
                <span className="font-medium">{s.nome}</span> — {s.nivel}
              </li>
            ))}
          </ul>
        ) : (
          <p className="whitespace-pre-line break-words leading-relaxed text-justify [text-align-last:start]">Adicione suas habilidades…</p>
        )}
      </section>

      {/* Experiência */}
      <section className="mb-6">
        <h3 className="whitespace-pre-line break-words leading-relaxed text-justify [text-align-last:start]">
          {nExp} Experiência Profissional
        </h3>
        {experiencias.length ? (
          <ul className="space-y-4">
            {experiencias.map((e) => (
              <li key={e.id}>
                <p className="font-semibold">
                  {e.cargo} · {e.empresa}
                </p>
                <p className="text-sm italic text-slate-600">
                  {e.periodo}
                  {e.atual ? ' (atual)' : ''}
                </p>
                <p className="text-justify">{e.descricao}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="whitespace-pre-line break-words leading-relaxed text-justify [text-align-last:start]">Adicione suas experiências…</p>
        )}
      </section>

      {/* Certificações */}
      <section className="mb-6">
        <h3 className="whitespace-pre-line break-words leading-relaxed text-justify [text-align-last:start]">{nCert} Certificações</h3>
        {certificacoes.length ? (
          <ul className="list-disc pl-6">
            {certificacoes.map((c) => (
              <li key={c.id}>
                <span className="font-medium">{c.titulo}</span>
                {c.orgao ? ` — ${c.orgao}` : ''}
                {c.ano ? ` (${c.ano})` : ''}
              </li>
            ))}
          </ul>
        ) : (
          <p className="whitespace-pre-line break-words leading-relaxed text-justify [text-align-last:start]">Adicione suas certificações…</p>
        )}
      </section>

      {/* Idiomas */}
      <section className="mb-2">
        <h3 className="whitespace-pre-line break-words leading-relaxed text-justify [text-align-last:start]">{nIdiomas} Idiomas</h3>
        {idiomas.length ? (
          <ul className="list-disc pl-6">
            {idiomas.map((l) => (
              <li key={l.id}>
                {l.idioma} — {l.nivel}
              </li>
            ))}
          </ul>
        ) : (
          <p className="whitespace-pre-line break-words leading-relaxed text-justify [text-align-last:start]">Adicione seus idiomas…</p>
        )}
      </section>
    </article>
  );
}
