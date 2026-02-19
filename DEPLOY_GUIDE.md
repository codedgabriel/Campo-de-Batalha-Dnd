# 🚀 Guia de Deploy — DMBattlefield na Vercel

## Diagnóstico do Problema Original

O `vercel.json` original mandava **tudo** para `server/index.ts` via `@vercel/node`, sem especificar o `outputDirectory` do build do Vite. Isso fazia a Vercel:
1. Não saber onde estava o HTML compilado
2. Servir arquivos como download (Content-Type errado)
3. Não ter rewrite de SPA para rotas do React

---

## Estrutura Final do Projeto

```
dmbattlefield/
├── api/
│   └── index.ts          ← Serverless Function (backend Express)
├── client/
│   ├── index.html
│   ├── public/
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── index.css
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       └── pages/
├── shared/
│   ├── schema.ts
│   └── routes.ts
├── dist/                 ← Gerado pelo build (não comite)
│   └── public/
│       ├── index.html
│       └── assets/
├── package.json          ← ATUALIZADO
├── vercel.json           ← ATUALIZADO
├── vite.config.ts        ← ATUALIZADO (removidos plugins Replit)
└── tsconfig.json         ← ATUALIZADO
```

---

## Arquivos Modificados

### 1. `vercel.json`

```json
{
  "version": 2,
  "buildCommand": "npm run vercel-build",
  "outputDirectory": "dist/public",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/index"
    },
    {
      "source": "/((?!api).*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

**Por que funciona:**
- `outputDirectory: "dist/public"` diz à Vercel onde está o HTML do Vite
- O rewrite `/((?!api).*)` → `index.html` garante SPA (qualquer rota não-API volta pro React)
- O header `X-Content-Type-Options: nosniff` impede download de arquivos
- Rotas `/api/*` são despachadas para a Serverless Function em `api/index.ts`

---

### 2. `package.json` — script `vercel-build`

```json
"scripts": {
  "vercel-build": "vite build"
}
```

**Motivo:** O script anterior usava `tsx script/build.ts` que rodava `esbuild` para empacotar o servidor. Na Vercel isso não é necessário — o backend vira Serverless Function automaticamente a partir da pasta `api/`. Só o Vite precisa rodar.

---

### 3. `vite.config.ts` — removidos plugins Replit

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
});
```

**Motivo:** Os plugins `@replit/vite-plugin-*` não existem no ambiente da Vercel e causam erro de build. Foram removidos com segurança.

---

### 4. `api/index.ts` — Backend como Serverless Function

```ts
import express from "express";

const app = express();
app.use(express.json());

app.get("/api/characters", async (_req, res) => {
  res.json([]);
});

// ... demais rotas

export default app;
```

**Como funciona:**
- A Vercel detecta automaticamente qualquer arquivo em `api/` e o transforma em Lambda (Serverless Function)
- O Express exportado como `default` é compatível com o adaptador Node.js da Vercel
- Não precisa de `listen()` — a Vercel injeta o handler

---

## Passo a Passo para Deploy

### Pré-requisitos
```bash
npm install -g vercel
```

### 1. Substituir os arquivos
Substitua na raiz do projeto:
- `vercel.json`
- `package.json`
- `vite.config.ts`
- `tsconfig.json`

Crie a pasta e arquivo:
- `api/index.ts`

### 2. Remover dependências Replit do package.json
Se você ainda tiver nos `devDependencies`:
```bash
npm uninstall @replit/vite-plugin-cartographer @replit/vite-plugin-dev-banner @replit/vite-plugin-runtime-error-modal
```

### 3. Testar o build localmente
```bash
npm run vercel-build
# deve gerar dist/public/index.html sem erros
```

### 4. Deploy
```bash
# Preview (para testar)
vercel

# Produção
vercel --prod
```

---

## Variáveis de Ambiente

Se você usar banco de dados no futuro, configure no painel da Vercel:

| Variável | Valor |
|----------|-------|
| `DATABASE_URL` | sua connection string do PostgreSQL |
| `NODE_ENV` | `production` |

---

## Fluxo de Requests em Produção

```
Browser → vercel.com
    │
    ├── GET /                    → dist/public/index.html (estático)
    ├── GET /tracker             → dist/public/index.html (SPA rewrite)
    ├── GET /assets/index.js     → dist/public/assets/... (estático)
    │
    └── GET /api/characters      → api/index.ts (Serverless Function)
```

---

## Por que Não Baixava Antes (Causa Raiz)

O `vercel.json` original configurava `@vercel/node` apontando para `package.json` sem `outputDirectory`. A Vercel então:
1. Tentava executar o servidor Express como se fosse uma função
2. Não encontrava o `dist/public` para servir estáticos
3. Servia o `index.html` com Content-Type errado ou como attachment

A correção separa responsabilidades:
- **Estáticos** → pasta `dist/public` (HTML, JS, CSS do Vite)
- **API** → pasta `api/` (Serverless Functions)
- **Rewrites** → `vercel.json` garante SPA e roteamento correto
