import {
  Controller,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { MtlsGuard } from '../auth/mtls.guard.js';
import { NodesService } from './nodes.service.js';

@Controller('nodes')
export class NodesController {
  constructor(private readonly nodesService: NodesService) {}

  @Post('register')
  @UseGuards(MtlsGuard)
  async registerNode(@Req() request: Request & { nodeCertificate?: unknown }) {
    const cert = request.nodeCertificate as
      { fingerprint256: string } | undefined;

    const fingerprint = cert?.fingerprint256;

    if (!fingerprint) {
      throw new UnauthorizedException('No node identity available');
    }

    return this.nodesService.registerNode(fingerprint);
  }
}
