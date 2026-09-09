# Technical Choices & Rationale

This document explains **why** ProfilsActifs is built the way it is. The short version: this is a **2-week pool project** built by a small team, so every choice favors things we already know, that have almost no setup cost, and that won't break under deadline pressure — over things that are theoretically "better" but slower to ship.

## Guiding Principle: Optimize for Shipping in 2 Weeks

With ~10 working days, the biggest risk isn't picking the "wrong" technology — it's losing days to infrastructure, tooling, or a stack nobody on the team knows well. So we deliberately chose a **boring, mainstream, well-documented stack** over anything trendy or "more scalable," and avoided splitting the app into more moving pieces than a small team can operate in two weeks.

## Npm workspaces

- **Choice**: One repository, two workspaces (`frontend`, `backend`), driven by a single root `package.json`.
- **Why**: A single `npm run setup` and `npm run dev` boots the database, both apps, and the ORM in one shot (see root `package.json`). With a small team and a hard deadline, we didn't want anyone losing time to "which repo/README do I follow" or juggling multiple `.env` files across separate repos.
- **Alternative considered**: Separate frontend/backend repos. Rejected — adds coordination overhead (versioning, PR sync, CI duplication) with zero benefit for a team this size and a project this short-lived.

## Backend: Node.js + Express + TypeScript

- **Why Node/Express**: Express is minimal, unopinionated, and everyone on the team already knows it — no time spent learning a new framework's conventions. It's also trivial to reason about (`routes/` -> `controllers/` -> Prisma), which matters when several people touch the API in parallel over two weeks (see `docs/API_ARCHITECTURE.md`).
- **Why TypeScript** (not plain JS): Catching typos and shape mismatches at compile time is cheaper than debugging them in a demo two days before the deadline. Combined with Prisma's generated types, most of the frontend/backend contract is checked automatically instead of manually.
- **Alternative considered**: NestJS or Fastify. Rejected — more structure/decorators/DI to learn than we needed; Express's simplicity was the whole point.

## Frontend: Next.js + React

- **Why**: React is the team's shared baseline, and Next.js gives us routing, API-friendly conventions, and a production build out of the box, so we don't spend project time hand-rolling a bundler/router setup. It also matches the "simple to run" goal: `next dev` / `next build` is all that's needed.
- **Why Tailwind CSS**: Utility classes let us style screens fast without maintaining separate CSS files or a design-system library — important when the visual identity (government style guide, see `docs/project_hierarchy.md`) can still shift mid-project.
- **Alternative considered**: A separate SPA (Vite + React) with its own routing/build config. Rejected — Next.js gives the same result with less setup.

## Database: PostgreSQL + Prisma 7

- **Why PostgreSQL**: Relational data fits this project well — users, profiles, videos, interactions, and a fixed 100-question questionnaire are all naturally linked records (see the ER diagram in `docs/architecture.md`). Postgres is free, well-understood, and runs locally with zero cloud dependency (see "Sovereignty" below).
- **Why Prisma**: The schema file (`prisma/schema.prisma`) is a single source of truth that generates both the SQL migrations and a fully-typed JS/TS client. That means no hand-written SQL, no manual sync between the DB shape and the backend types, and new tables/fields are usable within minutes of editing the schema — a big win when the data model still evolves daily during a 2-week build.
- **Alternative considered**: A raw SQL query builder (e.g. `pg` directly), or a NoSQL store like MongoDB. Rejected raw SQL for lack of type safety under time pressure; rejected NoSQL because the data is inherently relational (foreign keys between users, profiles, videos, skills, questionnaire answers) and we didn't want to reinvent joins in application code.


## Deployment: On-Premise / Self-Hosted (Sovereignty)

- **Why**: Per the Ministry's explicit requirement, everything must run on a Linux server or locally, with no paid cloud services (AWS/GCP/Azure) for compute, database, or storage (see `docs/deployment_note.md`). This isn't a preference — it's a hard constraint from Thomas Vignal (Digital Advisor) — but it also happens to keep the stack simple: no cloud console to configure, no IAM roles, no managed-service quirks to learn in week one.

## API Documentation: Swagger / OpenAPI

- **Why**: With multiple people adding routes over two weeks, an always-up-to-date `swagger.yaml` (served at `/api-docs`) is the fastest way to keep the frontend and backend teams in sync without a meeting for every new endpoint. It's a static YAML file with no extra service to run.

## Auth: JWT stored in `localStorage`

- **Choice**: The backend issues a signed JWT on login/register (`backend/src/controllers/auth.ts`), and the frontend keeps it in `localStorage` (`frontend/src/lib/api.ts`), attaching it as an `Authorization: Bearer` header on every request.
- **Why**: It's the simplest option that works with the current architecture — a client component reads the token synchronously wherever it's needed (`getToken()`), with no server-side session store or cookie-parsing middleware to add. `localStorage`'s well-known downside is exposure to XSS (any script that runs on the page can read it and exfiltrate the token), but today's codebase renders all user-supplied text through React's default escaping — there is no `dangerouslySetInnerHTML` anywhere in the frontend — so the concrete attack surface for stealing it is low.
- **Alternative considered**: An `httpOnly`/`Secure`/`SameSite` cookie, which is immune to token theft via XSS and would let a real Next.js `middleware.ts` gate protected routes at the edge (a `middleware.ts` can't read `localStorage` — it only sees cookies/headers, which is why route protection today is a client-side guard hook, `frontend/src/lib/use-require-auth.ts`, instead). Rejected for now: it requires the backend to set/read the cookie instead of returning the token in JSON, every frontend request to move to `credentials: "include"`, CORS to allow credentials, and a CSRF mitigation strategy — a bigger, riskier change than this security-hardening pass called for. Worth revisiting if the frontend ever renders user-supplied HTML directly, or as part of a dedicated auth-hardening pass.
