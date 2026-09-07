# Project Decision Hierarchy

When reading the project briefs and emails, conflicting instructions may appear. Here is the strict resolution hierarchy following the Matignon intervention (Sept 7).

## 1. Top Authority -> Matignon / Cabinet (Benjamin Sellami)

The definitive functional specifications (`docs/functional_specifications.md`) and the rollback instructions (`docs/mails/retour_version_1.md`) override EVERYTHING else.

- All "TikTok" mechanics, viral mechanics, and social rights connections are absolutely forbidden.
- The project is named **ProfilsActifs**. The name JibJob is banned.

## 2. Legal Requirements -> Florine Pontaillac

Legal compliance overrides UI aesthetics and product features.

- Strict age gating (16+ only, 16-18 hidden from public).
- Absolute physical deletion of video files upon consent revocation.
- Strict A Priori moderation for videos (no instant publishing).
- No public engagement counters (likes/views) to avoid discrimination.

## 3. Technical Constraints -> Thomas Vignal

Technical stability overrides product convenience.

- Questionnaire progress must be saved.
- Zod validation strictly enforces JSON shapes on boot.
- 100% local hosting, PostgreSQL, Swagger documentation.

## 4. BANNED Authority -> JEB's Initial Annotated Brief

**WARNING:** The annotated brief containing JEB's handwritten notes ("JibJob", "TikTok for the unemployed", "Likes = benefits") has been officially revoked by the Cabinet. It must be ignored.
