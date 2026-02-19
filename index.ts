// api/index.ts — Vercel Serverless Function
// Recebe todas as rotas /api/* e responde via Express adaptado

import express from "express";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Rotas da API ──────────────────────────────────────────────────────────────
// O projeto usa localStorage no frontend, então o backend é mínimo.
// Adicione aqui suas rotas conforme necessário.

app.get("/api/characters", async (_req, res) => {
  // Futuramente conecte ao banco; por ora retorna vazio
  res.json([]);
});

app.post("/api/characters", async (req, res) => {
  const character = req.body;
  // Futuramente persista no banco
  res.status(201).json(character);
});

app.put("/api/characters/:id", async (req, res) => {
  const { id } = req.params;
  res.json({ id, ...req.body });
});

app.delete("/api/characters/:id", async (_req, res) => {
  res.status(204).send();
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Exporta como handler serverless ──────────────────────────────────────────
export default app;
