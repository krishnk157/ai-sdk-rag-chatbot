# AI SDK RAG Chatbot

A retrieval-augmented chatbot that answers questions about Krishn's resume. Upload a PDF, it gets chunked and embedded into a Postgres vector store, and the chat assistant searches that store to ground its answers.

## How it works

- **Upload** (`/upload`) — a PDF is parsed with `pdf-parse`, split into ~150-character chunks with `@langchain/textsplitters`, embedded with Voyage AI (`voyage-3.5-lite`), and stored in Postgres via Drizzle.
- **Chat** (`/chat`) — powered by the [AI SDK](https://ai-sdk.dev) and Claude (`claude-haiku-4-5`). The model has a `searchKnowledgeBase` tool that runs a cosine-similarity search over the embedded chunks and answers strictly from the retrieved content.
- **Auth** — both routes and the API are protected by Clerk (`auth.protect()`), with `clerkMiddleware()` running on all non-static routes.
- **Vector search** — Postgres + `pgvector`, queried through Drizzle's `cosineDistance`, with an HNSW index on the `embedding` column.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + React 19
- [AI SDK](https://ai-sdk.dev) with `@ai-sdk/anthropic` and `@ai-sdk/voyage`
- [Clerk](https://clerk.com) for authentication
- [Neon](https://neon.tech) Postgres + [Drizzle ORM](https://orm.drizzle.team) + `pgvector`
- Tailwind CSS + shadcn-style UI components (`src/components/ui`, `src/components/ai-elements`)

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env.local` in the project root:

```bash
ANTHROPIC_API_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEON_DATABASE_URL=
VOYAGE_API_KEY=
```

- `ANTHROPIC_API_KEY` — Claude API key for the chat model.
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` — from your [Clerk](https://dashboard.clerk.com) app.
- `NEON_DATABASE_URL` — Postgres connection string (e.g. from [Neon](https://neon.tech)); the database needs the `pgvector` extension enabled.
- `VOYAGE_API_KEY` — for generating embeddings via Voyage AI.

### 3. Set up the database

Push the schema (a `documents` table with a `vector(1024)` column and an HNSW cosine index) to your database:

```bash
npx drizzle-kit push
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in, upload a PDF at `/upload`, then chat with it at `/chat`.

## Project structure

```
src/
  app/
    api/chat/route.ts   # streaming chat endpoint + searchKnowledgeBase tool
    chat/                # chat UI
    upload/              # PDF upload UI + server action
  lib/
    chunking.ts          # text splitting
    embeddings.ts        # Voyage embedding calls
    search.ts            # cosine-similarity vector search
    db-config.ts          # Drizzle/Neon client
    db-schema.ts          # `documents` table schema
  components/
    ai-elements/          # AI SDK chat/UI primitives
    ui/                    # shadcn-style UI components
```

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — Biome check
- `npm run format` — Biome format (write)

## Notes

- This is not the Next.js you're used to — check `node_modules/next/dist/docs/` for framework-specific conventions used in this project before making changes.
