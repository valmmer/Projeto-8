import express from "express";
import "dotenv/config";
import aiRouter from "./routes/ia"; // atenção ao .js por "type":"module"

const app = express();
app.use(express.json());

// rotas da IA
app.use("/api/ai", aiRouter);

// healthcheck (opcional)
app.get("/health", (_req, res) => res.send("ok"));

const PORT = process.env.API_PORT ?? 8787;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
