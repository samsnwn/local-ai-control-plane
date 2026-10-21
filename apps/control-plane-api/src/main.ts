import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { loadEnvironment } from './config/env.js';
import { buildHttpsOptions } from './config/tls-options.js';

/**
 * mTLS Configuration for Control Plane
 *
 * The Control Plane runs an HTTPS server with mutual TLS for node communication.
 *
 * Certificate files (local development only, gitignored):
 *   .dev-certs/ca.crt     - CA certificate (verifies node client certificates)
 *   .dev-certs/ca.key     - CA private key (never committed)
 *   .dev-certs/server.crt - Control Plane server certificate (presented to nodes)
 *   .dev-certs/server.key - Control Plane server private key (never committed)
 *   .dev-certs/node.crt   - Node client certificate (presented to the Control Plane)
 *   .dev-certs/node.key   - Node client private key (never committed)
 *
 * Generate locally with OpenSSL:
 *   # CA
 *   openssl genrsa -out .dev-certs/ca.key 2048
 *   openssl req -x509 -new -nodes -key .dev-certs/ca.key -sha256 -days 365 \
 *     -out .dev-certs/ca.crt -subj "/CN=Local AI Control Plane CA"
 *   # Control Plane server
 *   openssl genrsa -out .dev-certs/server.key 2048
 *   openssl req -new -key .dev-certs/server.key -out .dev-certs/server.csr \
 *     -subj "/CN=localhost"
 *   openssl x509 -req -in .dev-certs/server.csr -CA .dev-certs/ca.crt \
 *     -CAkey .dev-certs/ca.key -CAcreateserial -out .dev-certs/server.crt -days 365 -sha256
 *   # Node client (repeat per node, using a unique CN for each)
 *   openssl genrsa -out .dev-certs/node.key 2048
 *   openssl req -new -key .dev-certs/node.key -out .dev-certs/node.csr \
 *     -subj "/CN=node-01"
 *   openssl x509 -req -in .dev-certs/node.csr -CA .dev-certs/ca.crt \
 *     -CAkey .dev-certs/ca.key -CAcreateserial -out .dev-certs/node.crt -days 365 -sha256
 *
 * Environment variables:
 *   PORT                       - HTTPS port (default: 3000)
 *   NODE_TLS_CA_PATH           - path to CA cert (default: .dev-certs/ca.crt)
 *   NODE_TLS_CERT_PATH         - path to server cert (default: .dev-certs/server.crt)
 *   NODE_TLS_KEY_PATH          - path to server key (default: .dev-certs/server.key)
 *   NODE_TLS_ENFORCE_CLIENT_CA - "false" to accept any client certificate
 *                                (local development only; defaults to true)
 *
 * Values can be supplied through the repository-root `.env` file (copied from
 * `.env.example`), which is loaded at startup, or as real environment
 * variables, which take precedence over values from the file.
 *
 * Node processes authenticate with the CA-signed client certificate (node.crt /
 * node.key) and use ca.crt to verify the Control Plane's server certificate.
 *
 * The server always requests a client certificate (requestCert). By default it
 * also rejects the TLS handshake unless that certificate is signed by the
 * configured CA (rejectUnauthorized), so nodes without a valid client
 * certificate cannot connect. Setting NODE_TLS_ENFORCE_CLIENT_CA=false relaxes
 * the CA check for local development; MtlsGuard still rejects requests that
 * carry no certificate.
 *
 * Production: Replace with CA-signed certificates from your organization's PKI.
 */

async function bootstrap() {
  // Load the repository-root `.env` before PORT and the NODE_TLS_* variables
  // are read below. Real environment variables take precedence.
  loadEnvironment();

  const app = await NestFactory.create(AppModule, {
    httpsOptions: buildHttpsOptions(),
  });
  // Drain resources (e.g. the database pool) on SIGTERM/SIGINT instead of
  // dropping them when the process exits.
  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((error: unknown) => {
  Logger.error(
    error instanceof Error ? error.message : String(error),
    error instanceof Error ? error.stack : undefined,
    'Bootstrap',
  );
  process.exit(1);
});
