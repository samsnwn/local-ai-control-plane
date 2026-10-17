import { Test, TestingModule } from '@nestjs/testing';
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
    const fingerprint = 'SHA256:abc123';
    const expected = {
      id: 'node-1',
      identity: fingerprint,
      status: 'pending',
      createdAt: new Date(),
    };

    (nodesService.registerNode as ReturnType<typeof vi.fn>).mockResolvedValue(expected);

    const request = {
      nodeCertificate: { fingerprint },
    } as unknown as Request & { nodeCertificate: { fingerprint: string } };

    const result = await controller.registerNode(request, {});

    expect(nodesService.registerNode).toHaveBeenCalledWith(fingerprint);
    expect(result).toEqual(expected);
  });

  it('should use body.identity when no certificate fingerprint', async () => {
    const identity = 'SHA256:from-body';
    const expected = {
      id: 'node-2',
      identity,
      status: 'pending',
      createdAt: new Date(),
    };

    (nodesService.registerNode as ReturnType<typeof vi.fn>).mockResolvedValue(expected);

    const request = {
      nodeCertificate: undefined,
    } as unknown as Request & { nodeCertificate?: { fingerprint: string } };

    const result = await controller.registerNode(request, {
      identity,
    } as { identity: string });

    expect(nodesService.registerNode).toHaveBeenCalledWith(identity);
    expect(result).toEqual(expected);
  });

  it('should throw when no identity is available', async () => {
    const request = {
      nodeCertificate: undefined,
    } as unknown as Request & { nodeCertificate?: { fingerprint: string } };

    await expect(
      controller.registerNode(request, {}),
    ).rejects.toThrow('No node identity available');
  });
});
