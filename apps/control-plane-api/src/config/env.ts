import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Path to the repository-root `.env` file.
 *
 * `src/config/env.ts` and its compiled counterpart `dist/config/env.js` sit at
 * the same depth below the repository root, so this relative path resolves
 * correctly for `nest start`, `node dist/main.js`, and the test runners.
 */
export const ENV_FILE_PATH = fileURLToPath(
  new URL('../../../../.env', import.meta.url),
);

const loadedEnvFiles = new Set<string>();

/**
 * Loads environment variables from `envFilePath` into `process.env`.
 *
 * - Missing file: no-op, so CI and production (which inject environment
 *   variables directly) work without a `.env` file.
 * - Existing variables are never overwritten: a real environment variable
 *   takes precedence over the file, matching `dotenv` (used by drizzle-kit)
 *   and Node's `--env-file` semantics.
 * - Each path is loaded at most once per process.
 */
export function loadEnvironment(envFilePath: string = ENV_FILE_PATH): void {
  if (loadedEnvFiles.has(envFilePath)) {
    return;
  }
  loadedEnvFiles.add(envFilePath);

  if (existsSync(envFilePath)) {
    process.loadEnvFile(envFilePath);
  }
}

/**
 * Returns the trimmed value of a required environment variable, or throws a
 * startup error that explains how to provide it.
 */
export function requireEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. ` +
        `Define it in ${ENV_FILE_PATH} (\`cp .env.example .env\`) ` +
        'or export it in the environment.',
    );
  }

  return value;
}
