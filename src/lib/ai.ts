// src/lib/ai.ts
export type ImproveField = "resumo" | "experiencia" | "objetivo";

export type ImproveMeta = {
  domain?: "it";              // deixamos o default "it"
  roleTarget?: string;        // ex.: "Dev Full-Stack", "Analista de Segurança"
  seniority?: string;         // ex.: "Júnior" | "Pleno" | "Sênior"
  focus?: string;             // ex.: "cloud e segurança", "APIs REST"
  stack?: string[];           // ex.: ["Node.js","TypeScript","AWS"]
  locale?: string;            // ex.: "pt-BR" (default)
};

export type ImproveResponse = { ok: boolean; result?: string; error?: string };

type ImproveOpts = {
  signal?: AbortSignal;
  meta?: ImproveMeta;
};

/**
 * Chama o backend /api/ai/improve
 * - field: "resumo" | "experiencia" | "objetivo"
 * - prompt: texto ou prompt composto (no caso de objetivo você já manda o prompt rico)
 * - meta: preset TI (domínio, cargo-alvo etc)
 */
export async function improveText(
  prompt: string,
  field: ImproveField,
  opts: ImproveOpts = {}
): Promise<ImproveResponse> {
  const payload = {
    prompt,
    field,
    meta: {
      domain: "it",     // ✅ default para TI
      locale: "pt-BR",
      ...(opts.meta ?? {}),
    },
  };

  const resp = await fetch("/api/ai/improve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: opts.signal,
  });

  // tenta decodificar resposta do servidor
  let data: any = null;
  const text = await resp.text();
  try { data = text ? JSON.parse(text) : null; } catch { /* ignora */ }

  if (!resp.ok || !data?.ok) {
    // padrão de erro consistente
    const msg = data?.error || `HTTP ${resp.status} - ${text || "Falha na IA"}`;
    throw new Error(msg);
  }

  return { ok: true, result: data.result };
}
