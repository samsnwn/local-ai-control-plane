import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { loadEnvironment, requireEnv } from '../../config/env.js';
import * as schema from './schema.js';

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  private db: ReturnType<typeof drizzle> | null = null;

  async onModuleInit() {
    // Load the repository-root `.env` file (if present) before reading the
    // connection string. Existing environment variables take precedence, so
    // CI and production can inject DATABASE_URL directly without a `.env`.
    loadEnvironment();
    const databaseUrl = requireEnv('DATABASE_URL');

    this.pool = new Pool({
      connectionString: databaseUrl,
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
