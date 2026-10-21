import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DrizzleService } from '../database/drizzle.service.js';
import { nodes } from '../database/schema.js';
import { eq } from 'drizzle-orm';

export interface NodeRegistrationResult {
  id: string;
  identity: string;
  status: string;
  createdAt: Date;
}

type NodeRow = typeof nodes.$inferSelect;

@Injectable()
export class NodesService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async registerNode(fingerprint: string): Promise<NodeRegistrationResult> {
    const db = this.drizzleService.getDb();

    // Insert first so concurrent registrations rely on the unique constraint on
    // `identity` rather than a non-atomic select-then-insert check.
    const [created] = await db
      .insert(nodes)
      .values({
        identity: fingerprint,
        status: 'pending',
      })
      .onConflictDoNothing({ target: nodes.identity })
      .returning();

    if (created) {
      return this.toRegistrationResult(created);
    }

    const [existing] = await db
      .select()
      .from(nodes)
      .where(eq(nodes.identity, fingerprint))
      .limit(1);

    if (!existing) {
      // Only reachable if the conflicting row is removed between the insert and
      // this re-select; the conflicting row should otherwise always be present.
      throw new InternalServerErrorException(
        `Failed to register node with identity ${fingerprint}`,
      );
    }

    return this.toRegistrationResult(existing);
  }

  private toRegistrationResult(node: NodeRow): NodeRegistrationResult {
    return {
      id: node.id,
      identity: node.identity,
      status: node.status,
      createdAt: node.createdAt,
    };
  }
}
