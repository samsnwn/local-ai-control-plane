import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class MtlsGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const socket = request.socket;

    if (!socket || !('getPeerCertificate' in socket)) {
      throw new UnauthorizedException('No TLS connection');
    }

    const cert = socket.getPeerCertificate();

    if (!cert || !cert.fingerprint) {
      throw new UnauthorizedException('Client certificate required');
    }

    request.nodeCertificate = cert;

    return true;
  }
}
