# API Architecture Guide (ProfilsActifs)

This document is the absolute source of truth for how the backend is structured. **Any human or AI agent working on this repository MUST follow these rules when adding new routes.**

## 1. Directory Structure

```text
src/
 ├── index.ts          # Express setup, global middlewares, and Swagger
 ├── prisma.ts         # PrismaClient singleton. ALWAYS import prisma from here!
 ├── routes/           # Express Routers ONLY. No business logic!
 ├── controllers/      # Request/Response handling. Extract req.body, call DB, send res.
 └── middlewares/      # Express middlewares (Auth guards, Error handlers)
```

## 2. The Golden Rules

1. **NO Logic in Routes**: Files in `src/routes/` should only map HTTP verbs to Controller functions.
   - *Bad*: `router.post('/', async (req, res) => { const user = await prisma.user.create(...) })`
   - *Good*: `router.post('/', registerUser)`
2. **Always Use the Singleton**: Never instantiate `new PrismaClient()` in your controllers. Always use:
   `import { prisma } from '../prisma';`
3. **Global Error Handling**: You do NOT need to write `res.status(500)` manually for unhandled crashes. Let the `errorHandler` catch it.
4. **Swagger is Mandatory**: If you add a route (e.g. `/auth/register`), you MUST document it in `swagger.yaml` immediately.

## 3. Example: Adding an Auth Route

If the Auth team wants to add registration:
1. Create `src/controllers/auth.ts` -> Write `export const registerUser = async (req, res, next) => { ... }`
2. Create `src/routes/auth.ts` -> `router.post('/register', registerUser)`
3. Mount it in `src/routes/index.ts` -> `router.use('/auth', authRoutes)`
4. Document `/auth/register` in `swagger.yaml`.
