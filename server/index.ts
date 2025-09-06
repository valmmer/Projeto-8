// server/index.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import compression from "compression";

import aiRouter from "./routes/ia";
import { printRouter } from "./routes/print";

const app = express();

// Confiança em proxy (útil se hospedar atrás de nginx/heroku)
app.set("trust proxy", 1);

// CORS (ajuste CORS_ORIGIN se necessário)
const ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
app.use(
  cors({
    origin: ORIGIN,
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  })
);

// Body parsers com limite maior → evita 413 (Payload Too Large)
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Compressão de responses (PDF, JSON etc.)
app.use(compression());

// ------------------- Health -------------------
app.get("/api/ai/ping", (_req, res) => {
  res.json({
    ok: true,
    hasKey: Boolean(process.env.OPENROUTER_API_KEY),
    keyPrefix: process.env.OPENROUTER_API_KEY?.slice(0, 8) ?? null,
    model: process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini",
  });
});

app.get("/health", (_req, res) => res.send("ok"));
app.head("/health", (_req, res) => res.status(200).end());

// ------------------- Rotas --------------------
app.use("/api/ai", aiRouter);
app.use("/api/print", printRouter);

// 404 padrão
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Handler global de erros
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const code = err?.status || err?.statusCode || 500;
  const msg = err?.message || "Internal Server Error";
  console.error("[server] error:", err);
  res.status(code).json({ error: msg });
});

// ------------------- Start --------------------
const PORT = Number(process.env.API_PORT ?? 8787);
const server = app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});

// Encerramento gracioso
process.on("SIGTERM", () => server.close(() => process.exit(0)));
process.on("SIGINT", () => server.close(() => process.exit(0)));
