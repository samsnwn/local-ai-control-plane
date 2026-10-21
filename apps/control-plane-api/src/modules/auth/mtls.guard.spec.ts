import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { MtlsGuard } from './mtls.guard.js';

describe('MtlsGuard', () => {
  let guard: MtlsGuard;

  // The HTTPS server enforces client-certificate validity at the TLS layer
  // (`requestCert` + `rejectUnauthorized`), so certless clients are rejected
  // during the handshake. These specs exercise the guard in isolation; the
  // cases below cover the defense-in-depth paths for requests that reach the
  // guard without a verified peer certificate.
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MtlsGuard],
    }).compile();

    guard = module.get<MtlsGuard>(MtlsGuard);
  });

  it('should reject a socket with no peer certificate', () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          socket: {
            getPeerCertificate: () => ({}),
          },
        }),
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should reject a socket whose peer certificate has no fingerprint', () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          socket: {
            getPeerCertificate: () => undefined,
          },
        }),
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should accept a peer certificate and expose it on the request', () => {
    const cert = { fingerprint256: 'ab:cd:ef:12:34:56:78:90' };
    const request: { socket: unknown; nodeCertificate?: unknown } = {
      socket: {
        getPeerCertificate: () => cert,
      },
    };
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;

    const result = guard.canActivate(context);

    expect(result).toBe(true);
    expect(request.nodeCertificate).toBe(cert);
  });

  it('should reject a request whose socket cannot expose a peer certificate', () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });
});
