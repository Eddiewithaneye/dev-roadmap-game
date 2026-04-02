import { drizzle } from 'drizzle-orm/node-postgres';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'Missing DATABASE_URL. Add it to .env.local for local development and to Vercel for deployments.'
  );
}

export const db = drizzle(databaseUrl);
