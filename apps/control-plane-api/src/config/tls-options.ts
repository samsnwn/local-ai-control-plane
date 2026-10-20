import { readFileSync } from 'fs';
import type { NestApplicationOptions } from '@nestjs/common';

type HttpsOptions = NonNullable<NestApplicationOptions['httpsOptions']>;

/**
 * Whether the HTTPS server requires client certificates to be signed by the
 * configured CA. Defaults to enabled; it is disabled only when
 * `NODE_TLS_ENFORCE_CLIENT_CA` is explicitly set to "false" or "0".
 *
 * The default is intentionally secure: an unset or unrecognized value keeps
 * enforcement on, so production can never be relaxed by accident.
 */
export function isClientCertEnforcementEnabled(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  const value = env.NODE_TLS_ENFORCE_CLIENT_CA?.trim().toLowerCase();
  return value !== 'false' && value !== '0';
}

function readTlsFile(
  envVar: string,
  defaultPath: string,
  env: NodeJS.ProcessEnv,
): Buffer {
  const path = env[envVar] ?? defaultPath;
  try {
    return readFileSync(path);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to read TLS file for ${envVar} at "${path}": ${reason}. ` +
        'See the certificate generation steps in main.ts.',
    );
  }
}

function readOptionalTlsFile(
  envVar: string,
  defaultPath: string,
  env: NodeJS.ProcessEnv,
): Buffer | undefined {
  try {
    return readTlsFile(envVar, defaultPath, env);
  } catch {
    return undefined;
  }
}

/**
 * Builds the HTTPS server options for the Control Plane.
 *
 * The server always requests a client certificate (`requestCert`). When
 * enforcement is enabled it also rejects the handshake unless that certificate
 * is signed by the configured CA (`rejectUnauthorized` + `ca`). When enforcement
 * is disabled for local development, any presented client certificate is
 * accepted and the CA becomes optional; `MtlsGuard` still rejects requests that
 * carry no certificate.
 */
export function buildHttpsOptions(
  env: NodeJS.ProcessEnv = process.env,
): HttpsOptions {
  const enforceClientCa = isClientCertEnforcementEnabled(env);

  const ca = enforceClientCa
    ? readTlsFile('NODE_TLS_CA_PATH', '.dev-certs/ca.crt', env)
    : readOptionalTlsFile('NODE_TLS_CA_PATH', '.dev-certs/ca.crt', env);

  return {
    key: readTlsFile('NODE_TLS_KEY_PATH', '.dev-certs/server.key', env),
    cert: readTlsFile('NODE_TLS_CERT_PATH', '.dev-certs/server.crt', env),
    requestCert: true,
    rejectUnauthorized: enforceClientCa,
    ...(ca ? { ca: [ca] } : {}),
  };
}
