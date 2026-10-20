import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { NodesController } from './nodes.controller.js';
import { NodesService } from './nodes.service.js';
import { MtlsGuard } from '../auth/mtls.guard.js';

describe('NodesController', () => {
  let controller: NodesController;
  let nodesService: Partial<NodesService>;

  beforeEach(async () => {
    nodesService = {
      registerNode: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NodesController],
      providers: [
        {
          provide: NodesService,
          useValue: nodesService,
        },
      ],
    })
      .overrideGuard(MtlsGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();

    controller = module.get<NodesController>(NodesController);
  });

  it('should register a new node with certificate fingerprint', async () => {
    const fingerprint = 'ab:cd:ef:12:34:56:78:90';
    const expected = {
      id: 'node-1',
      identity: fingerprint,
      status: 'pending',
      createdAt: new Date(),
    };

    (nodesService.registerNode as ReturnType<typeof vi.fn>).mockResolvedValue(
      expected,
    );

    const request = {
      nodeCertificate: { fingerprint256: fingerprint },
    } as unknown as Request & {
      nodeCertificate: { fingerprint256: string };
    };

    const result = await controller.registerNode(request);

    expect(nodesService.registerNode).toHaveBeenCalledWith(fingerprint);
    expect(result).toEqual(expected);
  });

  it('should throw when no identity is available', async () => {
    const request = {
      nodeCertificate: undefined,
    } as unknown as Request & {
      nodeCertificate?: { fingerprint256: string };
    };

    await expect(controller.registerNode(request)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
