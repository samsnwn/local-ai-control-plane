import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/modules/database/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      'postgresql://local_ai_control_plane:local_development_password@localhost:5432/local_ai_control_plane',
  },
});
