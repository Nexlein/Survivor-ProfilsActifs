# Setup JibJob

## Stack

- Database: PostgreSQL
- ORM: Prisma
- Backend: Node.js + Express
- Frontend: Next.js (React)

## Prerequisites

- Node.js (v18+)
- PostgreSQL

## Environment Variables

Create `.env` in backend root:
DATABASE_URL="postgresql://user:password@localhost:5432/profilsactifs"
JWT_SECRET="secret"

## Database Setup

1. `npx prisma migrate dev`
2. `npx prisma generate`

## Run

Backend: `npm run dev` (port 3000)
Frontend: `npm run dev` (port 3001)
