# VoiceForm

Forms people can listen to and answer by speaking.

## Structure

```
voiceform/
├── apps/
│   ├── web/          Next.js 15, App Router, Tailwind, shadcn-style primitives
│   └── api/          FastAPI, SQLAlchemy 2.0, Alembic, ARQ workers
├── packages/
│   └── api-client/   TypeScript types generated from the API's OpenAPI spec
└── docs/
    ├── WORKING-DOC.md   Screen-by-screen build reference, mapped to Figma
    └── SETUP.md         Every key you need and how to get it
```

## Quick start

```bash
cp .env.example .env
docker compose up -d
pnpm install
cd apps/api && uv sync && cd ../..
pnpm api:check    # verifies every credential against the real service
pnpm api:migrate
pnpm api:dev      # http://localhost:8000/docs
pnpm dev          # http://localhost:3000
```

Full instructions in [docs/SETUP.md](docs/SETUP.md).

## Conventions

- No comments in code. Names carry the meaning.
- Backend is vertical slices: each `modules/<domain>/` owns its router, schemas, and service.
- Frontend separates `components/` (presentational, reusable) from `features/` (wired to data).
- Providers for email, storage, and speech sit behind protocols so they can be swapped in one file.
