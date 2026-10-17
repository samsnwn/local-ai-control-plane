import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../database/drizzle.service.js';
import { nodes } from '../database/schema.js';
import { eq } from 'drizzle-orm';

export interface NodeRegistrationResult {
  id: string;
  identity: string;
  status: string;
  createdAt: Date;
}

@Injectable()
export class NodesService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async registerNode(fingerprint: string): Promise<NodeRegistrationResult> {
    const db = this.drizzleService.getDb();

    const existing = await db
      .select()
      .from(nodes)
      .where(eq(nodes.identity, fingerprint))
      .limit(1);

    if (existing.length > 0) {
      return {
        id: existing[0].id,
        identity: existing[0].identity,
        status: existing[0].status,
        createdAt: existing[0].createdAt,
      };
    }

    const [created] = await db
      .insert(nodes)
      .values({
        identity: fingerprint,
        status: 'pending',
      })
      .returning();

    return {
      id: created.id,
      identity: created.identity,
      status: created.status,
      createdAt: created.createdAt,
    };
  }
}
