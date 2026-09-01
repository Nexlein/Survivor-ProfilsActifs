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

The easiest way to start the database is using Docker. We have provided a `docker-compose.yml` file.

**IMPORTANT**: Open your `.env` file and change `POSTGRES_PASSWORD` and `DATABASE_URL` to something secure, even for local development.

```bash
# Start the database in the background
docker compose up -d
```

**DOCKER TRAP**: If you change your password in `.env` *after* you have already started the database once, Postgres will ignore the new password. You MUST delete the old database volume first by running:

```bash
docker compose down -v
docker compose up -d
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
