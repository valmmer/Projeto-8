// src/lib/ai.ts
export type ImproveField = "resumo" | "experiencia" | "objetivo";

export type ImproveMeta = {
  // ===== Presets / domínio (compat com seu código atual) =====
  domain?: "it";              // default "it"
  roleTarget?: string;        // ex.: "Dev Full-Stack"
  seniority?: string;         // ex.: "Júnior" | "Pleno" | "Sênior"
  focus?: string;             // ex.: "cloud e segurança"
  stack?: string[];           // ex.: ["Node.js","TypeScript","AWS"]
  locale?: string;            // ex.: "pt-BR"

  // ===== Novos campos para contexto/estilo =====
  context?: string;           // prompt contextual extra (cargo, empresa, cidade, skills...)
  maxChars?: number;          // limite de caracteres (ex.: 160 p/ objetivo)
  tone?: "profissional" | "neutro" | "formal" | "casual";
  language?: string;          // alias p/ locale (ex.: "pt-BR")
  preset?: string;            // preset do backend (ex.: "ti-pt-br")

  // Se false, NÃO compõe prompt (usa o value como prompt final)
  compose?: boolean;
};

export type ImproveResponse = { ok: boolean; result?: string; error?: string };

type ImproveOpts = {
  signal?: AbortSignal;
  meta?: ImproveMeta;
};

/** Monta um prompt final a partir do texto do usuário + meta/opções */
function buildPrompt(
  field: ImproveField,
  text: string,
  meta?: ImproveMeta
) {
  const parts: string[] = [];
  const lang = meta?.language ?? meta?.locale ?? "pt-BR";
  const lim = meta?.maxChars ?? (field === "objetivo" ? 160 : undefined);

  if (meta?.context) parts.push(meta.context);

  const baseLabel =
    field === "experiencia" ? "Texto-base (experiência)" : "Texto-base";
  parts.push(`${baseLabel}: """${text}"""`);

  if (field === "objetivo") {
    parts.push(
      `Reescreva em UMA frase${lim ? ` (máx. ${lim} caracteres)` : ""}, ` +
        `tom ${meta?.tone ?? "profissional"}, em ${lang}.`,
      `Evite primeira pessoa, emojis e prefixos como "Objetivo:".`,
      `Responda apenas com a frase final.`
    );
  } else if (field === "resumo") {
    parts.push(
      `Melhore clareza e concisão, mantendo sentido, em ${lang}.`,
      `Responda apenas com o texto final.`
    );
  } else if (field === "experiencia") {
    parts.push(
      `Reescreva em bullets objetivos e de impacto (métricas quando possível), em ${lang}.`,
      `Responda apenas com o texto final.`
    );
  }

  return parts.join("\n");
}

/**
 * Chama o backend /api/ai/improve
 * - field: "resumo" | "experiencia" | "objetivo"
 * - textOrPrompt: texto do usuário OU prompt já composto
 * - meta: preset/ctx/limites etc. (se compose !== false, compomos o prompt aqui)
 */
export async function improveText(
  textOrPrompt: string,
  field: ImproveField,
  opts: ImproveOpts = {}
): Promise<ImproveResponse> {
  const meta = {
    domain: "it" as const,
    locale: "pt-BR",
    ...(opts.meta ?? {}),
  };

  const shouldCompose = meta.compose !== false; // default: compor
  const prompt = shouldCompose
    ? buildPrompt(field, textOrPrompt, meta)
    : textOrPrompt;

  const payload = { prompt, field, meta };

  const resp = await fetch("/api/ai/improve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: opts.signal,
  });

  let data: any = null;
  const text = await resp.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    /* ignore */
  }

  if (!resp.ok || !data?.ok) {
    const msg = data?.error || `HTTP ${resp.status} - ${text || "Falha na IA"}`;
    throw new Error(msg);
  }

  return { ok: true, result: data.result };
}
