import { z } from 'zod';

const envSchema = z.object({
    JWT_SECRET: z.string().min(1, 'JWT_SECRET must be set'),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL must be set'),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export const getEnv = (): Env => {
    if (cachedEnv) return cachedEnv;

    const result = envSchema.safeParse(process.env);
    if (!result.success) {
        console.error('[FATAL] Invalid or missing environment variables!');
        console.error('Validation errors:', JSON.stringify(result.error.issues, null, 2));
        process.exit(1);
    }

    cachedEnv = result.data;
    return cachedEnv;
};

// Reads an integer environment variable, falling back to `fallback` when the
// variable is unset or not a valid number.
export function getEnvInt(name: string, fallback: number): number {
    const raw = process.env[name];
    if (raw === undefined) return fallback;
    const parsed = parseInt(raw, 10);
    return Number.isNaN(parsed) ? fallback : parsed;
}
