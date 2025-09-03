import { useResume } from "../state/ResumeContext";

export default function Preview() {
  const { state } = useResume();
  const { dados, skills, experiencias, formacoes, certificacoes, idiomas } = state;

  const objetivo = (dados as Record<string, any>)?.objetivo;

  // monta a linha de contatos apenas com o que existir
  const contactParts = [
    dados.email?.trim(),
    dados.telefone?.trim(),
    dados.linkedin?.trim(), // ← só aparece se tiver
    dados.cidadePais?.trim(),
    (dados as any)?.dataNascimento?.trim()
      ? `Nasc.: ${(dados as any).dataNascimento.trim()}`
      : null,
  ].filter(Boolean) as string[];

  // linha extra (GitHub/Site) também opcional
  const extraParts = [
    (dados as any)?.github?.trim()
      ? `GitHub: ${(dados as any).github.trim()}`
      : null,
    (dados as any)?.site?.trim() ? `Site: ${(dados as any).site.trim()}` : null,
  ].filter(Boolean) as string[];

  return (
    <article className="max-w-3xl mx-auto text-black font-sans leading-relaxed">
      {/* Cabeçalho */}

      <header className="mb-6 text-center">
        {dados.foto && (
          <img
            src={dados.foto}
            alt={dados.nome || "Foto"}
            className="w-24 h-24 rounded-full mx-auto mb-2 border"
          />
        )}
        <h1 className="text-3xl font-bold">{dados.nome || "Seu Nome"}</h1>
        <p className="text-sm text-gray-700">
          {dados.email || "email"} · {dados.telefone || "telefone"} · {dados.linkedin || "LinkedIn"}
        </p>
      <header className="mb-6">
        <div className="flex items-center gap-4">
          {dados.foto?.trim() && (
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

            {/* Contatos — só mostra o que existe */}
            {contactParts.length > 0 ? (
              <p className="text-sm">{contactParts.join(' · ')}</p>
            ) : (
              <p className="text-sm text-slate-500">
                Preencha seus dados de contato…
              </p>
            )}

            {/* GitHub / Site — também opcional */}
            {extraParts.length > 0 && (
              <p className="text-sm">{extraParts.join(' · ')}</p>
            )}
          </div>
        </div>
        <hr className="mt-4" />
      </header>
      {/* Objetivo */}
      {objetivo?.trim() && (
        <section className="mb-4">
          <h2 className="font-semibold text-lg border-b border-gray-300">Objetivo Profissional</h2>
          <p className="mt-1 text-justify">{objetivo}</p>
        </section>
      )}

      {/* Resumo */}
      <section className="mb-4">
        <h2 className="font-semibold text-lg border-b border-gray-300">Resumo Profissional</h2>
        <p className="mt-1 text-justify">{dados.resumo || "Adicione um resumo profissional..."}</p>
      </section>

      {/* Formação */}
      <section className="mb-4">
        <h2 className="font-semibold text-lg border-b border-gray-300">Formação Acadêmica</h2>
        {formacoes.length ? (
          <ul className="list-disc pl-6 mt-1">
            {formacoes.map((f) => (
              <li key={f.id}>
                <span className="font-medium">{f.curso}</span> — {f.instituicao}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1">Adicione suas formações...</p>
          <p className="whitespace-pre-line break-words leading-relaxed text-justify [text-align-last:start]">
            Adicione suas formações…
          </p>
        )}
      </section>

      {/* Habilidades */}
      <section className="mb-4">
        <h2 className="font-semibold text-lg border-b border-gray-300">Habilidades</h2>
        {skills.length ? (
          <ul className="list-disc pl-6 mt-1">
            {skills.map((s) => (
              <li key={s.id}>{s.nome} — {s.nivel}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-1">Adicione suas habilidades...</p>
          <p className="whitespace-pre-line break-words leading-relaxed text-justify [text-align-last:start]">
            Adicione suas habilidades…
          </p>
        )}
      </section>

      {/* Experiências */}
      <section className="mb-4">
        <h2 className="font-semibold text-lg border-b border-gray-300">Experiência Profissional</h2>
        {experiencias.length ? (
          <ul className="mt-1 space-y-2">
            {experiencias.map((e) => (
              <li key={e.id}>
                <p className="font-bold">{e.cargo} — {e.empresa}</p>
                <p className="text-sm italic">{e.periodo}</p>
                <p>{e.descricao}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1">Adicione suas experiências...</p>
          <p className="whitespace-pre-line break-words leading-relaxed text-justify [text-align-last:start]">
            Adicione suas experiências…
          </p>
        )}
      </section>

      {/* Certificações */}
      <section className="mb-4">
        <h2 className="font-semibold text-lg border-b border-gray-300">Certificações</h2>
        {certificacoes.length ? (
          <ul className="list-disc pl-6 mt-1">
            {certificacoes.map((c) => (
              <li key={c.id}>{c.titulo} — {c.orgao || ""}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-1">Adicione suas certificações...</p>
          <p className="whitespace-pre-line break-words leading-relaxed text-justify [text-align-last:start]">
            Adicione suas certificações…
          </p>
        )}
      </section>

      {/* Idiomas */}
      <section className="mb-4">
        <h2 className="font-semibold text-lg border-b border-gray-300">Idiomas</h2>
        {idiomas.length ? (
          <ul className="list-disc pl-6 mt-1">
            {idiomas.map((l) => (
              <li key={l.id}>{l.idioma} — {l.nivel}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-1">Adicione seus idiomas...</p>
          <p className="whitespace-pre-line break-words leading-relaxed text-justify [text-align-last:start]">
            Adicione seus idiomas…
          </p>
        )}
      </section>
    </article>
  );
}
