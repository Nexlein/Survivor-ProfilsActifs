// Runs before every test file. Controllers now fail fast (process.exit)
// when JWT_SECRET/DATABASE_URL are missing (see src/utils/env.ts) — tests
// don't load the real .env, so seed harmless placeholder values here to
// keep that boot check from tearing down the whole test run.
process.env.JWT_SECRET ??= 'test-jwt-secret';
process.env.DATABASE_URL ??= 'postgresql://test:test@localhost:5432/test';
