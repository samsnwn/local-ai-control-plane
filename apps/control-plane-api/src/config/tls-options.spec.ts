import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import {
  buildHttpsOptions,
  isClientCertEnforcementEnabled,
} from './tls-options.js';

describe('isClientCertEnforcementEnabled', () => {
  it('defaults to enabled when unset', () => {
    expect(isClientCertEnforcementEnabled({})).toBe(true);
  });

  it('stays enabled for unrecognized values', () => {
    expect(
      isClientCertEnforcementEnabled({ NODE_TLS_ENFORCE_CLIENT_CA: 'no' }),
    ).toBe(true);
  });

  it.each(['false', 'FALSE', 'false ', '0'])('is disabled for %s', (value) => {
    expect(
      isClientCertEnforcementEnabled({ NODE_TLS_ENFORCE_CLIENT_CA: value }),
    ).toBe(false);
  });
});

describe('buildHttpsOptions', () => {
  let dir: string;

  const paths = (): NodeJS.ProcessEnv => ({
    NODE_TLS_KEY_PATH: join(dir, 'server.key'),
    NODE_TLS_CERT_PATH: join(dir, 'server.crt'),
    NODE_TLS_CA_PATH: join(dir, 'ca.crt'),
  });

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'tls-options-'));
    writeFileSync(join(dir, 'server.key'), 'key');
    writeFileSync(join(dir, 'server.crt'), 'cert');
    writeFileSync(join(dir, 'ca.crt'), 'ca');
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('requests client certs and enforces the CA by default', () => {
    const options = buildHttpsOptions(paths());

    expect(options.requestCert).toBe(true);
    expect(options.rejectUnauthorized).toBe(true);
    expect(options.ca).toEqual([Buffer.from('ca')]);
  });

  it('relaxes CA enforcement and makes the CA optional when disabled', () => {
    rmSync(join(dir, 'ca.crt'));

    const options = buildHttpsOptions({
      ...paths(),
      NODE_TLS_ENFORCE_CLIENT_CA: 'false',
    });

    expect(options.requestCert).toBe(true);
    expect(options.rejectUnauthorized).toBe(false);
    expect(options.ca).toBeUndefined();
  });

  it('still requires the server key and certificate', () => {
    rmSync(join(dir, 'server.key'));

    expect(() => buildHttpsOptions(paths())).toThrow(/NODE_TLS_KEY_PATH/);
  });
});
