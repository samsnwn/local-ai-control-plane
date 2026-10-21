import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as https from 'node:https';
import * as fs from 'node:fs';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { buildHttpsOptions } from '../src/config/tls-options.js';

/**
 * End-to-end coverage for `POST /nodes/register` over mTLS.
 *
 * Generates a throwaway CA, a server certificate, and a client certificate
 * (all signed by the CA) in a temporary directory, starts the Nest HTTPS
 * server with `buildHttpsOptions()`, and registers a node presenting the
 * client certificate. The client certificate's SHA-256 fingerprint is the
 * node identity recorded by `MtlsGuard` / `NodesService`.
 *
 * Requires a running PostgreSQL reachable through `DATABASE_URL` (provided by
 * CI; locally via `docker compose up -d` + `pnpm db:migrate`) and `openssl`.
 */
describe('Nodes registration (e2e, mTLS)', () => {
  let app: INestApplication;
  let certDir: string | undefined;
  let clientFingerprint: string;

  beforeAll(async () => {
    certDir = mkdtempSync(join(tmpdir(), 'nodes-register-e2e-'));

    // Local dev certificate flow mirrors the one documented in main.ts.
    writeFileSync(
      join(certDir, 'server.ext'),
      'subjectAltName=DNS:localhost,IP:127.0.0.1',
    );
    writeFileSync(join(certDir, 'client.ext'), 'subjectAltName=DNS:node-test');

    execSync(
      `openssl genrsa -out ca.key 2048 &&
       openssl req -x509 -new -nodes -key ca.key -sha256 -days 365 -out ca.crt -subj "/CN=Test CA" &&
       openssl genrsa -out server.key 2048 &&
       openssl req -new -key server.key -out server.csr -subj "/CN=localhost" &&
       openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out server.crt -days 365 -sha256 -extfile server.ext &&
       openssl genrsa -out client.key 2048 &&
       openssl req -new -key client.key -out client.csr -subj "/CN=node-test" &&
       openssl x509 -req -in client.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out client.crt -days 365 -sha256 -extfile client.ext`,
      { cwd: certDir, stdio: 'pipe' },
    );

    // Point the TLS options at the generated certs. Enforcement is on so the
    // server rejects clients without a CA-signed certificate.
    process.env.NODE_TLS_CA_PATH = join(certDir, 'ca.crt');
    process.env.NODE_TLS_CERT_PATH = join(certDir, 'server.crt');
    process.env.NODE_TLS_KEY_PATH = join(certDir, 'server.key');
    process.env.NODE_TLS_ENFORCE_CLIENT_CA = 'true';

    const httpsOptions = buildHttpsOptions();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication({ httpsOptions });
    await app.init();

    clientFingerprint = sha256Fingerprint(join(certDir, 'client.crt'));
  });

  afterAll(async () => {
    await app.close();
    if (certDir) {
      rmSync(certDir, { recursive: true, force: true });
    }
  });

  it('POST /nodes/register registers a node from its mTLS client certificate', async () => {
    const agent = httpsAgent(certDir!);

    const response = await request(app.getHttpServer())
      .post('/nodes/register')
      .agent(agent)
      .expect(201);

    expect(response.body.identity).toBe(clientFingerprint);
    expect(response.body.status).toBe('pending');
    expect(response.body.id).toBeDefined();
    expect(response.body.createdAt).toBeDefined();
  });

  it('POST /nodes/register is idempotent for the same client certificate', async () => {
    const agent = httpsAgent(certDir!);

    const first = await request(app.getHttpServer())
      .post('/nodes/register')
      .agent(agent)
      .expect(201);

    const second = await request(app.getHttpServer())
      .post('/nodes/register')
      .agent(agent)
      .expect(201);

    expect(second.body.identity).toBe(first.body.identity);
    expect(second.body.id).toBe(first.body.id);
    expect(second.body.status).toBe('pending');
  });
});

function httpsAgent(certDir: string) {
  const ca = fs.readFileSync(join(certDir, 'ca.crt'));
  const cert = fs.readFileSync(join(certDir, 'client.crt'));
  const key = fs.readFileSync(join(certDir, 'client.key'));

  return new https.Agent({
    ca: [ca],
    cert,
    key,
    rejectUnauthorized: true,
  });
}

/**
 * SHA-256 fingerprint of a certificate file (DER), formatted like
 * `AB:CD:EF:...`. Matches Node's `getPeerCertificate().fingerprint256`.
 */
function sha256Fingerprint(certPath: string): string {
  const output = execSync(
    `openssl x509 -in "${certPath}" -noout -fingerprint -sha256`,
    { encoding: 'utf-8' },
  );
  // "SHA256 Fingerprint=AB:CD:EF:..." (Node returns uppercase hex; keep it
  // so it matches getPeerCertificate().fingerprint256 exactly).
  return output.split('=')[1]!.trim();
}
