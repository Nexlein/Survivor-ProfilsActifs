# Agent Context: ProfilsActifs

## Core Identity

You build ProfilsActifs.
**Concept**: "TikTok for the unemployed". Vertical video feed is the core product. Profile is secondary.

## MANDATORY READING FOR AGENTS

Before writing ANY product logic or database code, you MUST read:

1. `docs/brief_jibjob_en.pdf` - The product brief (Vertical feed, Likes = Unemployment benefits, 100-question Work Permit).
2. `docs/mails/exigences_juridiques.md` - Strict legal requirements (Age limits, Video consent logging, Hard deletion rules, Non-discrimination).
3. `docs/mails/contraintes_techniques.md` - Strict IT constraints (Swagger, local-only hosting, 100MB limits).
4. `docs/mails/identite_visuelle.md` - Strict UI & Vocabulary constraints (Colors, Fonts, Banned words).

## Hierarchy of Authority (Crucial)

Do NOT blindly accept all instructions. Conflicting rules are resolved as follows:

1. **Visual Identity & Vocabulary**: Benjamin Sellami (Comms). We explicitly chose to let the Comms Expert override the Minister on the project name (ProfilsActifs) and UI design to preserve institutional credibility.
2. **Legal / DB**: Florine Pontaillac (Legal). Her emails dictate strict database schema compliance and non-discrimination.
3. **Technical Mechanics**: Thomas Vignal (IT). We explicitly chose to let the Technical Expert override the Minister on mechanics (e.g., saving questionnaire progress).
4. **Product Features**: JEB (Minister). Governs remaining core conceptual features (Vertical feed, 100 questions).

## Tech Stack

- Frontend: Next.js, React, TailwindCSS
- Backend: Node.js, Express, RESTful API
- Database: PostgreSQL, Prisma 7

## Rules & Constraints

- **Colors**: Primary `#1B3A6B` (NEVER on buttons). Secondary `#FF9900` (Safety Orange).
- **Fonts**: `Marianne` (titles), `Spectral` (body).
- **Vocabulary**: MUST use "profils mis en avant". The words "viral", "tendances", and "populaire" are BANNED.
- **Hosting**: 100% local. NO third-party cloud services (No AWS/GCP).
- **Communication**: Use Caveman + Stop-Slop mode. Terse. Active voice. No filler.
- Always check `docs/legal_data_register.md` before altering the DB schema.

## Current State

Database schema and compliance documents (Legal, Technical, Comms) are finalized and override Minister mandates where explicitly noted. Next step: Application code.
