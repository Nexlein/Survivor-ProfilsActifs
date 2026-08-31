# Installation Guide

## Prerequisites

- Node.js (v18+)
- PostgreSQL (Local install or Docker)

## 1. Clone Repository

```bash
git clone https://github.com/EpitechPGE3-2026/G-SVR-500-MPL-5-1-survivor-4.git
cd G-SVR-500-MPL-5-1-survivor-4
npm install
```

## 2. Database Setup

We use **Prisma ORM** with **PostgreSQL**. During development, each developer uses their own local database.

### Option A: Local Database

Create `.env` in root:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/profilsactifs?schema=public"
```

### Option B: Free Online Database (Prisma 7)

If you don't want to install PostgreSQL locally, Prisma 7 provides a free cloud database:

```bash
npx create-db
```

*(This automatically configures your `prisma7.config.ts` with a cloud `DATABASE_URL`)*.

## 3. Apply Schema & Generate Client

Prisma needs to build the SQL tables and generate the JS client.

```bash
# Push schema to database
npx prisma migrate dev

# Generate JS/TS client
npx prisma generate
```

## 4. Run Application

```bash
npm run dev
```
