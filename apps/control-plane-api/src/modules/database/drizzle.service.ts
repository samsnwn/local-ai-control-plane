import { Injectable, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema.js';

@Injectable()
export class DrizzleService implements OnModuleInit {
  private pool: Pool;
  private db: ReturnType<typeof drizzle>;

  onModuleInit() {
    this.pool = new Pool({
      connectionString:
        process.env.DATABASE_URL ??
        'postgresql://local_ai_control_plane:local_development_password@localhost:5432/local_ai_control_plane',
    });
    this.db = drizzle(this.pool, { schema });
  }

  getDb() {
    return this.db;
  }
}
