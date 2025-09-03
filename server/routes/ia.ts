import { Router } from "express";
import { z } from "zod";

const router = Router();

/* --------------------------- Schema do corpo --------------------------- */
const Body = z.object({
  prompt: z.string().min(1, "prompt vazio"),
  field: z.enum(["resumo", "experiencia", "objetivo"]),
  meta: z
    .object({
      domain: z.literal("it").default("it"),
      roleTarget: z.string().optional(),     // Ex.: "Desenvolvedor Full-Stack", "Analista de Segurança"
      seniority: z.string().optional(),      // Ex.: "Júnior", "Pleno", "Sênior"
      focus: z.string().optional(),          // Ex.: "cloud e segurança", "back-end com Node e Postgres"
      stack: z.array(z.string()).optional(), // Ex.: ["React", "Node.js", "Docker", "AWS"]
      locale: z.string().default("pt-BR"),
    })
    .optional(),
});

/* ----------------------------- Helpers -------------------------------- */
function normKey(raw?: string | null) {
  return (raw ?? "").toString().trim().replace(/^Bearer\s+/i, "");
}

function pickModel() {
  const raw = (process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini").trim();
  if (raw.startsWith("http")) return "openai/gpt-4o-mini";
  return raw;
}

function getHeaders() {
  const key = normKey(process.env.OPENROUTER_API_KEY);
  if (!key || !key.startsWith("sk-or-v1-")) {
    throw new Error("OPENROUTER_API_KEY ausente ou inválida no .env");
  }
  const referer = (process.env.OPENROUTER_SITE_URL ?? "http://localhost").trim();
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    "HTTP-Referer": referer,
    "X-Title": "Projeto-8 CV Builder",
  };
}

/* -------------------- Guia de escrita para TI (ATS) ------------------- */
const IT_STYLE_GUIDE = `
- Linguagem: ${"pt-BR"}; tom profissional, conciso, sem emojis.
- ATS-friendly: evitar formatação markdown; usar verbos de ação; palavras-chave técnicas da área.
- Quantificar impacto quando possível (%, tempo, custo, volume).
- Evitar 1ª pessoa; frases diretas; sem jargões vazios.
`;

/* ------------------- Prompts especializados por campo ------------------ */
function systemPromptFor(field: "resumo" | "experiencia" | "objetivo", meta?: z.infer<typeof Body>["meta"]) {
  const domain = meta?.domain ?? "it";
  const role = meta?.roleTarget ? `Função alvo: ${meta.roleTarget}.` : "";
  const senior = meta?.seniority ? `Senioridade alvo: ${meta.seniority}.` : "";
  const focus = meta?.focus ? `Foco: ${meta.focus}.` : "";
  const stack = meta?.stack?.length ? `Stack: ${meta.stack.join(", ")}.` : "";

  const context = [role, senior, focus, stack].filter(Boolean).join(" ");

  if (field === "resumo") {
    return `
Você é um editor de currículos para a área de ${domain.toUpperCase()}.
${IT_STYLE_GUIDE}
Tarefa: Reescreva o RESUMO PROFISSIONAL do usuário em até 600 caracteres, focando em competências técnicas e impacto, com palavras-chave relevantes de TI. Evite 1ª pessoa.
${context}
Responda APENAS com o texto final (sem markdown).
`.trim();
  }

  if (field === "experiencia") {
    return `
Você é um editor de experiências profissionais para a área de ${domain.toUpperCase()}.
${IT_STYLE_GUIDE}
Tarefa: Reescreva a DESCRIÇÃO DE EXPERIÊNCIA usando bullet points (um por linha, separados por " • "), na estrutura STAR (situação-tarefa-ação-resultado), destacando tecnologias, responsabilidades e resultados mensuráveis.
${context}
Responda APENAS com os bullets (sem markdown).
`.trim();
  }

  // objetivo
  return `
Você é um editor de currículos para a área de ${domain.toUpperCase()}.
${IT_STYLE_GUIDE}
Tarefa: Escreva/reescreva um OBJETIVO PROFISSIONAL em 1 frase (máx. 160 caracteres), direto e sem "Objetivo:", sem 1ª pessoa, citando função/área e valor gerado (ex.: "Otimização de custos cloud", "construção de APIs escaláveis").
${context}
Responda APENAS com a frase final.
`.trim();
}

/* --------------------------- /api/ai/improve --------------------------- */
router.post("/improve", async (req, res) => {
  try {
    const { prompt, field, meta } = Body.parse(req.body);
    const headers = getHeaders();
    const model = pickModel();

    const payload = {
      model,
      messages: [
        { role: "system", content: systemPromptFor(field, meta) },
        { role: "user", content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 320,
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25_000);

    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    }).finally(() => clearTimeout(timer));

    if (!resp.ok) {
      const text = await resp.text();
      return res.status(resp.status).json({ ok: false, error: `OpenRouter ${resp.status}: ${text}` });
    }

    const data: any = await resp.json().catch(() => ({}));
    const result = data?.choices?.[0]?.message?.content?.toString()?.trim?.() ?? "";

    return res.json({ ok: true, result });
  } catch (err: any) {
    const msg = err?.name === "AbortError" ? "Timeout ao chamar OpenRouter." : (err?.message || "Bad Request");
    return res.status(400).json({ ok: false, error: msg });
  }
});

/* ------------------------------- /diag --------------------------------- */
router.get("/diag", async (_req, res) => {
  try {
    const headers = getHeaders();
    const r = await fetch("https://openrouter.ai/api/v1/models", { headers });
    const text = await r.text();
    res.status(r.status).type("application/json").send(text);
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message ?? "diag fail" });
  }
});

export default router;
