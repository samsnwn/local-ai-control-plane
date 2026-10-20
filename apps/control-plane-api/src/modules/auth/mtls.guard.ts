import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

/**
 * Defense-in-depth check that a node request arrived over a TLS socket with a
 * peer certificate.
 *
 * The TLS layer is the primary enforcement point: with `requestCert: true` and
 * `rejectUnauthorized: true`, the HTTPS server rejects the handshake for clients
 * that present no certificate or one not signed by the configured CA, so such
 * requests never reach this guard. This guard covers paths where TLS termination
 * may be bypassed or misconfigured (for example a reverse proxy in front of the
 * API) and exposes the verified certificate on `request.nodeCertificate` for
 * downstream handlers.
 */
@Injectable()
export class MtlsGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const socket = request.socket;

    if (!socket || !('getPeerCertificate' in socket)) {
      throw new UnauthorizedException('No TLS connection');
    }

    const cert = socket.getPeerCertificate();

    // `fingerprint256` is the SHA-256 digest of the DER certificate; it is used
    // as the node identity, so avoid the SHA-1 `fingerprint` field.
    if (!cert || !cert.fingerprint256) {
      throw new UnauthorizedException('Client certificate required');
    }

    request.nodeCertificate = cert;

    return true;
  }
}
