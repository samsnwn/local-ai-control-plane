import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { readFileSync } from 'fs';
import { createServer } from 'https';

/**
 * mTLS Configuration for Control Plane
 *
 * The Control Plane runs an HTTPS server with mutual TLS for node communication.
 *
 * Certificate files (local development only, gitignored):
 *   .dev-certs/ca.crt     - CA certificate (trusted by Control Plane to verify nodes)
 *   .dev-certs/server.crt - Control Plane server certificate (presented to nodes)
 *   .dev-certs/server.key - Control Plane server private key (never committed)
 *
 * Generate locally with OpenSSL:
 *   openssl genrsa -out .dev-certs/ca.key 2048
 *   openssl req -x509 -new -nodes -key .dev-certs/ca.key -sha256 -days 365 \
 *     -out .dev-certs/ca.crt -subj "/CN=Local AI Control Plane CA"
 *   openssl genrsa -out .dev-certs/server.key 2048
 *   openssl req -new -key .dev-certs/server.key -out .dev-certs/server.csr \
 *     -subj "/CN=localhost"
 *   openssl x509 -req -in .dev-certs/server.csr -CA .dev-certs/ca.crt \
 *     -CAkey .dev-certs/ca.key -CAcreateserial -out .dev-certs/server.crt -days 365 -sha256
 *
 * Environment variables:
 *   NODE_TLS_CA_PATH      - path to CA cert (default: .dev-certs/ca.crt)
 *   NODE_TLS_CERT_PATH    - path to server cert (default: .dev-certs/server.crt)
 *   NODE_TLS_KEY_PATH     - path to server key (default: .dev-certs/server.key)
 *
 * Production: Replace with CA-signed certificates from your organization's PKI.
 */

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const httpsOptions = {
    key: readFileSync(process.env.NODE_TLS_KEY_PATH ?? '.dev-certs/server.key'),
    cert: readFileSync(
      process.env.NODE_TLS_CERT_PATH ?? '.dev-certs/server.crt',
    ),
    ca: [readFileSync(process.env.NODE_TLS_CA_PATH ?? '.dev-certs/ca.crt')],
    requestUnauthorized: false,
    rejectUnauthorized: false,
  };

  const httpsServer = createServer(
    httpsOptions,
    app.getHttpServer().requestListener,
  );
  await new Promise<void>((resolve) =>
    httpsServer.listen(process.env.PORT ?? 3000, resolve),
  );
}
await bootstrap();
