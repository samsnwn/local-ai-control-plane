import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { MtlsGuard } from '../auth/mtls.guard.js';
import { NodesService } from './nodes.service.js';

interface RegisterNodeBody {
  identity?: string;
}

@Controller('nodes')
export class NodesController {
  constructor(private readonly nodesService: NodesService) {}

  @Post('register')
  @UseGuards(MtlsGuard)
  async registerNode(
    @Req() request: Request & { nodeCertificate?: unknown },
    @Body() body: RegisterNodeBody,
  ) {
    const cert = request.nodeCertificate as
      | { fingerprint: string; subject?: Record<string, unknown> }
      | undefined;

    const fingerprint = cert?.fingerprint ?? body.identity;

    if (!fingerprint) {
      throw new Error('No node identity available');
    }

    return this.nodesService.registerNode(fingerprint);
  }
}
