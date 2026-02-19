# replit.md

## Overview

This is a **D&D Initiative Tracker** — a fantasy-themed web application for managing combat turn order in tabletop RPG games (like Dungeons & Dragons). Users can add combatants (players and NPCs), set initiative values, roll initiative, advance turns, drag-and-drop to reorder, and clear encounters. The UI text is in Portuguese (e.g., "Adicionar Combatente", "Invocação de Combatente").

Despite having a full backend setup with Express and PostgreSQL, the primary data persistence is through **localStorage** on the client side. The backend/database layer exists as a scaffold for potential future server-side sync but is not the primary data path for this app.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Client)
- **Framework**: React with TypeScript, bundled by Vite
- **Routing**: Wouter (lightweight client-side router) — single main route (`/` → Tracker page)
- **State Management**: React hooks with localStorage persistence (`useCharacters` custom hook)
- **UI Components**: shadcn/ui component library (new-york style) built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for a dark fantasy theme (Cinzel display font, Lato body font, bronze/gold/crimson color palette)
- **Drag & Drop**: @dnd-kit/core and @dnd-kit/sortable for reordering initiative list
- **Animations**: Framer Motion for list transitions
- **ID Generation**: nanoid for creating unique character IDs client-side
- **Data Fetching**: @tanstack/react-query is configured but not heavily used since data lives in localStorage

### Backend (Server)
- **Framework**: Express.js with TypeScript, run via tsx
- **Database**: PostgreSQL via node-postgres (`pg` Pool), with Drizzle ORM
- **Schema**: Defined in `shared/schema.ts` using Drizzle's `pgTable` — a `characters` table with id, name, type, initiative, isTurn, and tieBreaker fields
- **API Routes**: Minimal REST endpoints defined in `server/routes.ts` and typed in `shared/routes.ts` — currently only a GET endpoint for listing characters is wired up
- **Build**: Custom build script using esbuild for server and Vite for client; production output goes to `dist/`

### Key Design Decisions

1. **localStorage-first architecture**: The app was designed to work entirely client-side. The `useCharacters` hook reads/writes to localStorage, not the API. The backend exists as a placeholder for future server sync.

2. **Shared schema between client and server**: `shared/schema.ts` defines the Drizzle schema and Zod validation schemas. The client-side `Character` interface in `use-characters.ts` mirrors this but is independently defined — keep them in sync if modifying.

3. **Dark fantasy theme**: The CSS uses custom properties for a carefully crafted dark theme with bronze/gold primary colors and crimson accents. Fonts are loaded from Google Fonts (Cinzel for headings, Lato for body).

4. **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`, `@assets/` maps to `attached_assets/`.

### Directory Structure
```
client/               # Frontend React application
  src/
    components/       # App components (AddCharacterForm, CharacterCard)
      ui/             # shadcn/ui component library
    hooks/            # Custom hooks (useCharacters, useToast, useMobile)
    lib/              # Utilities (queryClient, utils)
    pages/            # Page components (Tracker, not-found)
server/               # Express backend
  index.ts            # Server entry point
  routes.ts           # API route registration
  storage.ts          # Database storage layer
  db.ts               # Database connection
  vite.ts             # Vite dev server middleware
  static.ts           # Static file serving for production
shared/               # Shared between client and server
  schema.ts           # Drizzle DB schema + Zod types
  routes.ts           # API route type definitions
migrations/           # Drizzle migration files
script/               # Build scripts
```

## External Dependencies

- **PostgreSQL**: Required database (connection via `DATABASE_URL` environment variable). Used by Drizzle ORM. Schema push via `npm run db:push`.
- **Google Fonts**: Cinzel, Lato, DM Sans, Fira Code, Geist Mono, and Architects Daughter loaded via CDN in `index.html` and `index.css`.
- **No authentication**: The app has no auth system — it's a single-user local tool.
- **No external APIs**: No third-party service integrations beyond font CDNs.