// Reads an integer environment variable, falling back to `fallback` when the
// variable is unset or not a valid number.
export function getEnvInt(name: string, fallback: number): number {
    const raw = process.env[name];
    if (raw === undefined) return fallback;
    const parsed = parseInt(raw, 10);
    return Number.isNaN(parsed) ? fallback : parsed;
}
