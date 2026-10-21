import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { ENV_FILE_PATH, loadEnvironment, requireEnv } from './env.js';

const TEST_VAR = 'LOAD_ENVIRONMENT_TEST_VALUE';

describe('ENV_FILE_PATH', () => {
  it('resolves to the repository-root .env file', () => {
    expect(ENV_FILE_PATH.endsWith('.env')).toBe(true);
    expect(
      existsSync(join(dirname(ENV_FILE_PATH), 'pnpm-workspace.yaml')),
    ).toBe(true);
  });
});

describe('loadEnvironment', () => {
  let dir: string;
  let originalValue: string | undefined;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'env-'));
    originalValue = process.env[TEST_VAR];
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
    if (originalValue === undefined) {
      delete process.env[TEST_VAR];
    } else {
      process.env[TEST_VAR] = originalValue;
    }
  });

  it('loads variables from the given file', () => {
    const file = join(dir, '.env');
    writeFileSync(file, `${TEST_VAR}=from-file\n`);

    loadEnvironment(file);

    expect(process.env[TEST_VAR]).toBe('from-file');
  });

  it('does not overwrite variables that already exist in the environment', () => {
    const file = join(dir, '.env');
    writeFileSync(file, `${TEST_VAR}=from-file\n`);
    process.env[TEST_VAR] = 'from-environment';

    loadEnvironment(file);

    expect(process.env[TEST_VAR]).toBe('from-environment');
  });

  it('is a no-op when the file does not exist', () => {
    delete process.env[TEST_VAR];

    expect(() => loadEnvironment(join(dir, '.env'))).not.toThrow();

    expect(process.env[TEST_VAR]).toBeUndefined();
  });

  it('loads each path at most once per process', () => {
    const file = join(dir, '.env');
    writeFileSync(file, `${TEST_VAR}=first\n`);
    loadEnvironment(file);

    writeFileSync(file, `${TEST_VAR}=second\n`);
    loadEnvironment(file);

    expect(process.env[TEST_VAR]).toBe('first');
  });
});

describe('requireEnv', () => {
  let originalValue: string | undefined;

  beforeEach(() => {
    originalValue = process.env[TEST_VAR];
  });

  afterEach(() => {
    if (originalValue === undefined) {
      delete process.env[TEST_VAR];
    } else {
      process.env[TEST_VAR] = originalValue;
    }
  });

  it('returns the trimmed value when the variable is set', () => {
    process.env[TEST_VAR] = '  value  ';

    expect(requireEnv(TEST_VAR)).toBe('value');
  });

  it('throws a descriptive error when the variable is missing', () => {
    delete process.env[TEST_VAR];

    expect(() => requireEnv(TEST_VAR)).toThrow(
      new RegExp(`Missing required environment variable ${TEST_VAR}`),
    );
  });

  it('rejects an empty value', () => {
    process.env[TEST_VAR] = '   ';

    expect(() => requireEnv(TEST_VAR)).toThrow(
      new RegExp(`Missing required environment variable ${TEST_VAR}`),
    );
  });
});
