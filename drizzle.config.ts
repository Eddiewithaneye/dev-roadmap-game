import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '.env.local' });
config();

const migrationsUrl = process.env.DATABASE_URL_MIGRATIONS;

if (!migrationsUrl) {
  throw new Error(
    'Missing DATABASE_URL_MIGRATIONS. Add it to .env.local before running Drizzle commands.'
  );
}

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: migrationsUrl,
  },
  strict: true,
});
