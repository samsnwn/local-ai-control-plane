import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema.js';

export const DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://local_ai_control_plane:local_development_password@localhost:5432/local_ai_control_plane';

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  private db: ReturnType<typeof drizzle> | null = null;

  async onModuleInit() {
    this.pool = new Pool({
      connectionString: DATABASE_URL,
    });
    try {
      await this.pool.query('SELECT 1');
    } catch (error) {
      await this.pool.end();
      throw new Error(
        `Failed to connect to database: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
    this.db = drizzle(this.pool, { schema });
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
    }
  }

  getDb() {
    if (!this.db) {
      throw new Error(
        'Database not initialized. Ensure DrizzleService onModuleInit has run.',
      );
    }
    return this.db;
  }
}
