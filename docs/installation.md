# Installation Guide

## Prerequisites

- Node.js (v18+)
- Docker & Docker Compose (required for local PostgreSQL)

## 1. Clone Repository

```bash
git clone git@github.com:Nexlein/Survivor-ProfilsActifs.git
cd Survivor-ProfilsActifs
```

## 2. Environment Configuration

Copy the template environment files and secure your database password:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

**IMPORTANT:** Open `backend/.env` and change `POSTGRES_PASSWORD` to a secure value before proceeding.

## 3. Automated Setup

We use an automated Monorepo setup to install dependencies, boot the database, push the schema, and generate the ORM client in a single command.

```bash
npm run setup
```

**DOCKER TRAP:** If you change your password in `backend/.env` *after* you have already run setup, Postgres will ignore the new password because the volume is already initialized. You MUST delete the old database volume first by running:

```bash
npm run db:clean
npm run db:start
```

## 4. Database Seeding (Optional)

To automatically populate your database with test users (Admin, Recruiter, Job Seekers), skills, videos, and questionnaire data, run the seeder:

```bash
npm run db:seed
```

*Note: This will erase all existing data in your local database before injecting the fresh data.*

## 5. Running the Application

### Development Mode (Hot-Reloading)

Start both the Next.js frontend and Express backend simultaneously:

```bash
npm run dev
```

### Production Mode

Build and start the highly optimized production bundles:

```bash
npm run build
npm run start
```

## 5. Access Points

- **Frontend:** [http://localhost:3001](http://localhost:3001)
- **Backend API:** [http://localhost:3000](http://localhost:3000)
- **Swagger Documentation:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
