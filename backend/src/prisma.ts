import * as dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '../generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Prisma 7 requires explicit driver adapters for SQL providers
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit when using hot-reloading (nodemon/Next.js).
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
