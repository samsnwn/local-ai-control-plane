import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DrizzleService } from '../database/drizzle.service.js';
import { nodes } from '../database/schema.js';
import { NodesService } from './nodes.service.js';

type NodeRow = typeof nodes.$inferSelect;

const fingerprint = 'ab:cd:ef:12:34:56:78:90';

const existingRow: NodeRow = {
  id: '6f1e2b3a-0000-4000-8000-000000000001',
  identity: fingerprint,
  status: 'pending',
  lastHeartbeat: null,
  softwareVersion: null,
  modelMetadata: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

const expected = {
  id: existingRow.id,
  identity: fingerprint,
  status: 'pending',
  createdAt: existingRow.createdAt,
};

describe('NodesService', () => {
  let service: NodesService;

  let insert: ReturnType<typeof vi.fn>;
  let values: ReturnType<typeof vi.fn>;
  let onConflictDoNothing: ReturnType<typeof vi.fn>;
  let returning: ReturnType<typeof vi.fn>;

  let select: ReturnType<typeof vi.fn>;
  let from: ReturnType<typeof vi.fn>;
  let where: ReturnType<typeof vi.fn>;
  let limit: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    returning = vi.fn();
    onConflictDoNothing = vi.fn(() => ({ returning }));
    values = vi.fn(() => ({ onConflictDoNothing }));
    insert = vi.fn(() => ({ values }));

    limit = vi.fn();
    where = vi.fn(() => ({ limit }));
    from = vi.fn(() => ({ where }));
    select = vi.fn(() => ({ from }));

    const db = { insert, select };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NodesService,
        { provide: DrizzleService, useValue: { getDb: () => db } },
      ],
    }).compile();

    service = module.get<NodesService>(NodesService);
  });

  it('inserts a new node and returns the created row', async () => {
    returning.mockResolvedValue([existingRow]);

    const result = await service.registerNode(fingerprint);

    expect(insert).toHaveBeenCalledWith(nodes);
    expect(values).toHaveBeenCalledWith({
      identity: fingerprint,
      status: 'pending',
    });
    expect(onConflictDoNothing).toHaveBeenCalledWith({
      target: nodes.identity,
    });
    expect(select).not.toHaveBeenCalled();
    expect(result).toEqual(expected);
  });

  it('returns the existing node when the insert hits the unique constraint', async () => {
    returning.mockResolvedValue([]);
    limit.mockResolvedValue([existingRow]);

    const result = await service.registerNode(fingerprint);

    expect(from).toHaveBeenCalledWith(nodes);
    expect(result).toEqual(expected);
  });

  it('throws when the conflicting row cannot be re-selected', async () => {
    returning.mockResolvedValue([]);
    limit.mockResolvedValue([]);

    await expect(service.registerNode(fingerprint)).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});
