// server/index.ts
import "dotenv/config";
import express from "express";
// Se usa Vite proxy (recomendado), você NÃO precisa de CORS aqui.
// Se NÃO usar proxy, descomente as 2 linhas abaixo:
// import cors from "cors";
// app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:5173" }));

// ✅ SE usa tsx:
//   import sem extensão:
import aiRouter from "./routes/ia";
// ✅ SE roda node dist:
//   use: import aiRouter from "./routes/ai.js";

const app = express();
app.use(express.json());

// health/ping para diagnosticar .env
app.get("/api/ai/ping", (_req, res) => {
  res.json({
    ok: true,
    hasKey: Boolean(process.env.OPENROUTER_API_KEY),
    keyPrefix: process.env.OPENROUTER_API_KEY?.slice(0, 12) ?? null, // não loga a chave inteira
    model: process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini",
  });
});

// rotas da IA
app.use("/api/ai", aiRouter);

app.get("/health", (_req, res) => res.send("ok"));

const PORT = Number(process.env.API_PORT ?? 8787);
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
  console.log(
    `OpenRouter key loaded: ${process.env.OPENROUTER_API_KEY ? "YES" : "NO"}`
  );
});
