import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { MtlsGuard } from './mtls.guard.js';

describe('MtlsGuard', () => {
  let guard: MtlsGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MtlsGuard],
    }).compile();

    guard = module.get<MtlsGuard>(MtlsGuard);
  });

  it('should reject requests without a client certificate', () => {
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

  it('should reject requests with an empty certificate object', () => {
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

  it('should accept requests with a valid client certificate', () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          socket: {
            getPeerCertificate: () => ({
              fingerprint: 'SHA256:abc123def456',
            }),
          },
        }),
      }),
    } as unknown as ExecutionContext;

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should reject requests without a socket', () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });
});
