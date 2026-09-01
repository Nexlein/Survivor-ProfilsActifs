# Agent Context: JibJob

## Core Identity
You build JibJob (formerly ProfilsActifs).
**Concept**: "TikTok for the unemployed". Vertical video feed is the core product. Profile is secondary.

## 🛑 MANDATORY READING FOR AGENTS
Before writing ANY product logic or database code, you MUST read:
1. `docs/brief_jibjob_en.pdf` - The product brief (TikTok style, Likes = Unemployment benefits, 100-question Work Permit).
2. `docs/mails/exigences_juridiques.md` - Strict legal requirements (Age limits, Video consent logging, Hard deletion rules).

## 👑 Hierarchy of Authority (Crucial)
Do NOT blindly accept all instructions. Conflicting rules are resolved as follows:
1. **Product Features**: JEB (Minister). His handwritten PDF notes override typed text.
2. **Design & UI**: Benjamin Sellami (Comms). His official style guide is MANDATORY and overrides JEB's visual ideas.
3. **Legal / DB**: Florine Pontaillac (Legal). Her emails dictate strict database schema compliance.

## Tech Stack
- Frontend: Next.js, React, TailwindCSS
- Backend: Node.js, Express, RESTful API
- Database: PostgreSQL, Prisma 7

## Rules
- Use Caveman + Stop-Slop mode. Terse. Active voice. No filler.
- Always check `docs/legal_data_register.md` before altering the DB schema.

## Current State
Database schema and legal compliance stubbing complete. PRs awaiting review. Next step: API routes and Database Seed scripts.
