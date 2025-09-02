import { Router } from "express";
import { z } from "zod";

const router = Router();

const Body = z.object({
  prompt: z.string().min(1),
  field: z.enum(["resumo", "experiencia", "objetivo"]), // ✅ adiciona "objetivo"
});

router.post("/improve", async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return res
        .status(500)
        .json({ ok: false, error: "Faltando OPENROUTER_API_KEY no .env" });
    }

    const { prompt, field } = Body.parse(req.body);

    // ✅ system por campo
    const system =
      field === "resumo"
        ? "Você é um editor de currículos. Reescreva o texto do usuário em tom profissional, claro e conciso. Foque em competências e impacto. Responda APENAS com o texto revisado, sem markdown."
        : field === "experiencia"
        ? "Você é um editor de experiências profissionais. Use verbos de ação, resultados mensuráveis e clareza. Traga 2–4 frases ou 3–5 bullets, sem repetir cargo/empresa. Responda APENAS com o texto revisado, sem markdown."
        : // objetivo
          "Você é um coach de carreira. Escreva/reescreva um OBJETIVO PROFISSIONAL em 1 frase (máx. 160 caracteres), direto, focado na função/segmento e no valor gerado. Sem primeira pessoa, sem emojis, sem prefixos. Responda apenas com a frase final.";

    // ✅ ajustes por tipo
    const temperature = field === "experiencia" ? 0.6 : field === "resumo" ? 0.7 : 0.5;
    const max_tokens = field === "objetivo" ? 80 : 300;

    // Node 18+ já tem fetch global
    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        // Boas práticas pedidas pela OpenRouter:
        "HTTP-Referer": process.env.OPENROUTER_SITE_URL ?? "http://localhost",
        "X-Title": "Projeto-8 CV Builder",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
        temperature,
        max_tokens,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return res
        .status(500)
        .json({ ok: false, error: `OpenRouter ${resp.status}: ${text}` });
    }

    const data: any = await resp.json();
    const result = data?.choices?.[0]?.message?.content?.toString()?.trim?.() ?? "";

    if (!result) {
      return res.status(502).json({ ok: false, error: "Resposta vazia da IA." });
    }

    // tenta pegar métricas de uso se vierem
    const usage = data?.usage
      ? {
          input: data.usage.prompt_tokens ?? undefined,
          output: data.usage.completion_tokens ?? undefined,
        }
      : undefined;

    return res.json({ ok: true, result, tokens: usage });
  } catch (err: any) {
    return res
      .status(400)
      .json({ ok: false, error: err?.message || "Bad Request" });
  }
});

export default router;
