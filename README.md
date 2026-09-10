# VoiceForm

Forms people can listen to and answer by speaking.

A respondent opens a form link, hears each question read aloud, and answers with their voice. The answer is transcribed, matched to the right option, and saved. Creators build forms in a drag-and-drop builder, publish them with a link or QR code, and watch responses arrive live.

This README takes you from a machine with nothing installed to a running system. If you already have the toolchain, skip to [4. Configure your environment](#4-configure-your-environment).

---

## Contents

1. [What you need installed](#1-what-you-need-installed)
2. [Get the code](#2-get-the-code)
3. [Start the local services](#3-start-the-local-services)
4. [Configure your environment](#4-configure-your-environment)
5. [Install dependencies](#5-install-dependencies)
6. [Verify your credentials](#6-verify-your-credentials)
7. [Create the database tables](#7-create-the-database-tables)
8. [Run it](#8-run-it)
9. [Check it works](#9-check-it-works)
10. [Everyday commands](#everyday-commands)
11. [Environment variables](#environment-variables)
12. [Project structure](#project-structure)
13. [Troubleshooting](#troubleshooting)
14. [Running the tests](#running-the-tests)
15. [Conventions](#conventions)
16. [Going to production](#going-to-production)

---

## 1. What you need installed

Five things. Install them in this order.

| Tool | Version | What it is for |
|---|---|---|
| **Git** | any recent | Cloning the repository |
| **Docker Desktop** | any recent | Runs Postgres, Redis and a local mail server |
| **Node.js** | 20.11.0 or newer | Runs the Next.js frontend |
| **pnpm** | 9.12.0 | The package manager this repo uses (not npm or yarn) |
| **uv** | any recent | Installs Python 3.12 and the backend dependencies |

You do **not** need to install Python yourself. `uv` downloads the correct version (3.12) automatically.

### macOS

```bash
# Homebrew, if you don't have it (skip if `brew --version` already works)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

brew install git node
brew install --cask docker

# pnpm and uv
corepack enable && corepack prepare pnpm@9.12.0 --activate
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Then **open Docker Desktop from Applications once** and let it finish starting. Docker commands fail until the whale icon in the menu bar stops animating.

### Linux (Debian / Ubuntu)

```bash
sudo apt update && sudo apt install -y git curl

# Node 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Docker Engine
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER   # then log out and back in

corepack enable && corepack prepare pnpm@9.12.0 --activate
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### Windows

Use **WSL2** and follow the Linux instructions inside it. Running this stack directly on Windows is not supported. Install WSL2 from an admin PowerShell:

```powershell
wsl --install
```

Then install Docker Desktop for Windows and enable its WSL2 integration in Settings → Resources → WSL Integration.

### Confirm everything is ready

```bash
git --version        # any
node --version       # v20.11.0 or higher
pnpm --version       # 9.12.0
uv --version         # any
docker info          # must print server info, not an error
```

If `docker info` errors, Docker Desktop is not running yet. Start it and wait.

---

## 2. Get the code

```bash
git clone https://github.com/delinaaw/final-year-project-2026.git voiceform
cd voiceform
```

Every command from here runs from this folder unless stated otherwise.

---

## 3. Start the local services

Postgres, Redis and Mailpit run in Docker so you don't have to install them.

```bash
pnpm services:up
```

That starts three containers:

| Service | Port | What it does |
|---|---|---|
| Postgres 16 | **5433** | The database |
| Redis 7 | 6379 | Rate limiting, background job queue |
| Mailpit | 1025 (SMTP), 8025 (web) | Catches every email locally so you can read it in a browser |

Postgres is on **5433**, not the usual 5432, deliberately. If you already have Postgres installed on your machine it will be sitting on 5432, and it would silently shadow the container.

Check they came up:

```bash
docker compose ps
```

All three should say `running`. Mailpit's inbox is at **http://localhost:8025** — every verification and password-reset email will land there.

---

## 4. Configure your environment

```bash
cp .env.example .env
```

Now open `.env` and fill it in. **Three values are mandatory** — the API refuses to start without them. The rest have working defaults or turn features on as you add them.

### The minimum to boot

```bash
# Generate a real secret key and paste it in as SECRET_KEY
openssl rand -hex 32
```

| Variable | Set it to |
|---|---|
| `SECRET_KEY` | The output of the command above |
| `DATABASE_URL` | Already correct in `.env.example` — leave it |
| `REDIS_URL` | Already correct in `.env.example` — leave it |

### Point email at Mailpit

`.env.example` ships with Gmail's settings. For local development, change two lines so mail goes to Mailpit instead of the internet:

```bash
SMTP_HOST=localhost
SMTP_PORT=1025
```

The backend detects a local relay and skips authentication and STARTTLS automatically, so `SMTP_USER` and `SMTP_PASSWORD` can stay blank.

With just this much you can sign up, log in, build forms, publish them, and collect **typed** responses.

### For the voice features

Voice needs three external accounts. Each is free to start and takes about five minutes.

| Variable | Service | Needed for |
|---|---|---|
| `DEEPGRAM_API_KEY` | [Deepgram](https://console.deepgram.com) | Speech to text |
| `ELEVENLABS_API_KEY` | [ElevenLabs](https://elevenlabs.io) | Reading questions aloud |
| `S3_*` | [Cloudflare R2](https://dash.cloudflare.com) | Storing audio recordings |

**[docs/SETUP.md](docs/SETUP.md) walks through every one of these click by click** — where the button is, which permissions to tick, what the value looks like. Follow it rather than guessing.

Two things that reliably catch people out:

- **R2 endpoint URL**: it is `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` with **no bucket name on the end**. The bucket goes in `S3_BUCKET` separately. An endpoint with the bucket appended still passes a naive round-trip test but breaks in real use.
- **ElevenLabs key scopes**: a key with the wrong scopes returns `401`, which looks exactly like an invalid key. Regenerating won't help. Check the scopes on the key instead.

### Optional

| Variable | Effect if blank |
|---|---|
| `CLERK_*` | Google and Apple sign-in buttons won't work. Email and password sign-in is VoiceForm's own and works without Clerk. |
| `ANTHROPIC_API_KEY` | The "dictate your questions" feature stays off. Everything else is unaffected. |
| `SENTRY_DSN`, `POSTHOG_KEY` | No error tracking or analytics. Fine locally. |

---

## 5. Install dependencies

```bash
pnpm install                        # frontend
uv sync --directory apps/api        # backend, and Python 3.12 if you don't have it
```

The first run downloads a lot. Later runs are near-instant.

---

## 6. Verify your credentials

Before running anything, check that what you put in `.env` actually works. This script does not trust your keys — it connects to every real service, writes and deletes a test object in R2, sends a real email, and authenticates against Deepgram and ElevenLabs.

```bash
pnpm api:check
```

You want output like this:

```
VoiceForm preflight · development

  PASS  SECRET_KEY     64 characters
  PASS  Postgres       PostgreSQL 16.15 on aarch64-unknown-linux-musl
  PASS  Redis          v7.4.11
  PASS  Cloudflare R2  put/get/delete on voiceform-media
  PASS  SMTP           test email delivered to Mailpit at http://localhost:8025
  PASS  Deepgram       authenticated as Your Project
  PASS  ElevenLabs     21 voices available
  SKIP  Google OAuth   client id or secret is empty

Ready to build.
```

- **PASS** — working.
- **SKIP** (yellow) — not configured, but not required to start. You can build forms; voice will not work.
- **FAIL** (red) — blocking. The line tells you what the provider itself said. Fix it before continuing.

Re-run this any time something breaks. It is faster than reading logs.

---

## 7. Create the database tables

```bash
pnpm api:migrate
```

This runs every Alembic migration against the Postgres container. Run it again whenever you pull changes that add migrations.

---

## 8. Run it

You need **two** terminals, plus an optional third.

**Terminal 1 — the API**

```bash
pnpm api:dev
```

Serves on **http://localhost:8000**. Interactive API docs at **http://localhost:8000/docs**.

**Terminal 2 — the web app**

```bash
pnpm dev
```

Serves on **http://localhost:3000**.

This also runs `scripts/sync-web-env.mjs` first, which copies every `NEXT_PUBLIC_*` variable from the root `.env` into `apps/web/.env.local`. Next.js only reads its own folder, so this keeps one `.env` as the single source of truth. If you change a `NEXT_PUBLIC_*` value, restart `pnpm dev`.

**Terminal 3 — the background worker (optional)**

```bash
pnpm api:worker
```

Sends daily response digests at 08:00 and purges expired tokens at 03:00. Nothing in the main flow depends on it; skip it unless you are working on those jobs.

Open **http://localhost:3000** and you're running.

---

## 9. Check it works

A five-minute path through the whole system:

1. Go to http://localhost:3000 and **create an account**.
2. Open **http://localhost:8025** (Mailpit). Your verification email is there. Copy the code and verify.
3. **Create a form.** Add a short-answer question and a multiple-choice question.
4. Hit **Publish**, then open the public link (or scan the QR code with your phone).
5. Answer it. Allow microphone access when the browser asks, and speak your answer.
6. Back in the dashboard, open **Responses** — yours is there, with the recording attached.

If step 5 stays silent, `pnpm api:check` will tell you which of Deepgram, ElevenLabs or R2 is not configured.

> Voice needs a real browser with a real microphone. It will not work in a headless browser, and Chrome and Safari only grant microphone access on `localhost` or over HTTPS.

---

## Everyday commands

Run all of these from the repository root.

### Running

| Command | Does |
|---|---|
| `pnpm dev` | Frontend on :3000 |
| `pnpm api:dev` | API on :8000 with hot reload |
| `pnpm api:worker` | Background job worker |
| `pnpm services:up` | Start Postgres, Redis, Mailpit |
| `pnpm services:down` | Stop them |

### Database

| Command | Does |
|---|---|
| `pnpm api:migrate` | Apply all pending migrations |
| `pnpm api:revision "add x to y"` | Generate a migration from model changes |

### Quality gates

| Command | Does |
|---|---|
| `pnpm api:test` | Backend tests (pytest) |
| `pnpm api:typecheck` | Backend types (mypy) |
| `pnpm api:lint` | Backend lint (Ruff) |
| `pnpm api:format` | Backend formatter (Ruff) |
| `pnpm typecheck` | Frontend types (tsc) |
| `pnpm lint` | Frontend lint (ESLint) |

### Other

| Command | Does |
|---|---|
| `pnpm api:check` | Verify every credential against the live service |
| `pnpm env:sync` | Push `NEXT_PUBLIC_*` from `.env` into the web app |
| `pnpm client:generate` | Regenerate TypeScript types from the API's OpenAPI spec |

The generated client (`packages/api-client/src/schema.d.ts`) is committed, so a fresh clone typechecks without running anything. Regenerate it whenever you change an endpoint's request or response shape — the API must be running on :8000 when you do.

---

## Environment variables

Every variable lives in one `.env` at the repository root. `.env` is gitignored and must never be committed.

| Group | Variables | Required |
|---|---|---|
| Core | `APP_ENV`, `APP_URL`, `API_URL`, `SECRET_KEY` | `SECRET_KEY` only |
| Data | `DATABASE_URL`, `REDIS_URL` | Yes, both |
| Tokens | `ACCESS_TOKEN_TTL_MINUTES`, `REFRESH_TOKEN_TTL_DAYS`, `REFRESH_TOKEN_TTL_DAYS_REMEMBERED` | Defaults are fine |
| Social sign-in | `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_AUDIENCE`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Only for Google/Apple |
| Email | `EMAIL_PROVIDER`, `EMAIL_FROM`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_STARTTLS` | Point at Mailpit locally |
| Storage | `STORAGE_PROVIDER`, `S3_ENDPOINT_URL`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_BASE_URL` | For voice |
| Speech | `STT_PROVIDER`, `DEEPGRAM_API_KEY`, `TTS_PROVIDER`, `ELEVENLABS_API_KEY` | For voice |
| Drafting | `LLM_PROVIDER`, `ANTHROPIC_API_KEY` | Optional |
| Observability | `SENTRY_DSN`, `POSTHOG_KEY` | Optional |
| Frontend | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_POSTHOG_KEY` | Defaults are fine |
| Security | `CORS_ORIGINS` | Change for deployment |

`CORS_ORIGINS` is a JSON array: `CORS_ORIGINS=["https://yourdomain.com"]`.

---

## Project structure

```
voiceform/
├── apps/
│   ├── web/                      Next.js 15, App Router, Tailwind v4
│   │   └── src/
│   │       ├── app/              Routes
│   │       ├── components/       Presentational, reusable
│   │       ├── features/         Wired to data
│   │       ├── hooks/            Recording, live transcription, offline queue
│   │       └── lib/              API client, env, utilities
│   └── api/                      FastAPI, SQLAlchemy 2.0, Alembic, ARQ
│       ├── src/voiceform/
│       │   ├── core/             Config, database, security, limiter, uploads
│       │   ├── db/               Models, enums, migrations
│       │   ├── modules/          One folder per domain
│       │   │   ├── auth/         Sign-up, sign-in, Clerk exchange
│       │   │   ├── forms/        Create, publish, theme
│       │   │   ├── questions/    CRUD, reordering, dictation
│       │   │   ├── responses/    Public answering, results, CSV
│       │   │   ├── speech/       TTS, STT, option matching
│       │   │   ├── storage/      R2 behind a protocol
│       │   │   └── email/        SMTP behind a protocol
│       │   └── workers/          Scheduled jobs
│       ├── scripts/check_env.py  The credential verifier
│       └── tests/
├── packages/api-client/          TypeScript types from the OpenAPI spec
├── docs/
│   ├── SETUP.md                  Every key, step by step
│   └── WORKING-DOC.md            Screen-by-screen reference, mapped to Figma
└── docker-compose.yml
```

Each backend module is a vertical slice owning its own `router.py`, `schemas.py` and `service.py`. Email, storage and speech sit behind protocols, so swapping Gmail for Postmark or R2 for S3 means writing one file.

---

## Troubleshooting

**`docker info` fails, or `pnpm services:up` errors**
Docker Desktop is not running. Open it and wait for it to finish starting.

**`role "voiceform" does not exist`, or the API can't reach the database**
You have a local Postgres on port 5432 shadowing the container. The container is deliberately on **5433** — check `DATABASE_URL` in `.env` says `localhost:5433`. Confirm what is listening with `lsof -i :5433`.

**`AUTH extension not supported` when sending email**
You are pointing Gmail credentials at Mailpit. For local development set `SMTP_HOST=localhost` and `SMTP_PORT=1025` and leave the username and password blank.

**No verification email arrives**
Check Mailpit at http://localhost:8025 rather than your real inbox. In development, mail never leaves your machine.

**ElevenLabs returns 401 with a key you just created**
It is the key's scopes, not the key. Regenerating produces the same error. Open the key in the ElevenLabs dashboard and check its permissions.

**R2 uploads succeed but files aren't where you expect**
`S3_ENDPOINT_URL` probably has the bucket name appended. It should end at `.r2.cloudflarestorage.com`.

**`pnpm dev` starts but the frontend can't reach the API**
Run `pnpm env:sync`, then restart `pnpm dev`. Next.js reads `apps/web/.env.local`, which is generated from the root `.env`.

**The microphone button does nothing**
The browser blocked it. Check the padlock in the address bar and allow microphone access for `localhost:3000`. Safari and Chrome only permit it on `localhost` or HTTPS.

**`429 Too Many Requests` while testing**
Working as intended. Sign-up is capped at 5 per hour per IP and login at 10 per minute. Wait, or use a different email. Six wrong passwords in 15 minutes also locks that account for 15 minutes.

**Never run `pnpm build` while `pnpm dev` is running.** Both write to `.next`, and the build wipes the dev server's state out from under it. Stop the dev server first.

---

## Running the tests

```bash
pnpm api:test        # 44 backend tests
pnpm api:typecheck   # mypy
pnpm api:lint        # Ruff
pnpm typecheck       # tsc, across the web app and the API client
pnpm lint            # ESLint
```

The backend tests create and drop their own `voiceform_test` database on each run, so Postgres must be up. Rate limiting is disabled during tests.

The frontend has no test suite yet. `pnpm test` is wired to Vitest but there are no test files, so it will report none found.

---

## Conventions

- **No comments in code.** Names carry the meaning. If a line needs a comment, it needs a better name.
- Backend is **vertical slices** — a module owns its router, schemas and service.
- Frontend separates `components/` (presentational, reusable) from `features/` (wired to data).
- Email, storage and speech sit behind **protocols** so providers swap in one file.
- Every credential is verified against the **real service** by `pnpm api:check`, never assumed.

---

## Going to production

Before deploying:

- Generate a **new** `SECRET_KEY`. Never reuse the development one.
- Set `APP_ENV=production`. This disables `/docs`.
- Set `CORS_ORIGINS` to your real domain. The default is localhost only.
- Move email off Gmail SMTP to a transactional provider. Gmail has low sending limits and will throttle you.
- Set `CLERK_AUDIENCE` so social sign-in tokens are checked against your instance.
- Serve over HTTPS. Browsers refuse microphone access on plain HTTP.
- Run `pnpm api:migrate` as part of your deploy.
- Run the worker (`pnpm api:worker`) as a separate long-running process.
