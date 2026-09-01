# Installation Guide

## Prerequisites

- Node.js (v18+)
- PostgreSQL (Local install or Docker)

## 1. Clone Repository

```bash
git clone git@github.com:Nexlein/Survivor-ProfilsActifs.git
cd Survivor-ProfilsActifs
npm install
```

## 2. Database Setup

We use **Prisma ORM** with **PostgreSQL**. During development, each developer uses their own local database.

### Option A: Local Database (Recommended)

We now use an automated Monorepo setup to make this completely effortless.

**IMPORTANT**: First, copy the environment files and edit them to secure your database:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Open backend/.env and change POSTGRES_PASSWORD!
```

Once your `.env` is secure, run the magic setup script at the root of the project:

```bash
# This installs all dependencies, generates Prisma, and boots the Docker database!
npm run setup
```

**DOCKER TRAP**: If you change your password in `.env` *after* you have already run setup, Postgres will ignore the new password. You MUST delete the old database volume first by running:

```bash
npm run db:stop -v
npm run db:start
```

To start the entire platform (Frontend + Backend) simultaneously:

```bash
npm run dev
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

We use `nodemon` to run the TypeScript Express server with hot-reloading.

```bash
npm run dev
```

You should see the following in your terminal:

```text
Server ready at http://localhost:3000
Swagger UI available at http://localhost:3000/api-docs
```
