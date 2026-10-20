import { config as loadEnv } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'drizzle-kit';

// drizzle-kit runs with this package as the working directory, so the
// repository-root `.env` (created from `.env.example`) is resolved relative to
// this file. Variables already present in the environment take precedence;
// dotenv never overrides them.
const envPath = fileURLToPath(new URL('../../.env', import.meta.url));
loadEnv({ path: envPath, quiet: true });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    `DATABASE_URL is not set. Define it in ${envPath} ` +
      '(`cp .env.example .env`) or export it before running drizzle-kit.',
  );
}

export default defineConfig({
  out: './drizzle',
  schema: './src/modules/**/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
});
