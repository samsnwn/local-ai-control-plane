import { Module } from '@nestjs/common';
import { DrizzleService } from './drizzle.service.js';

@Module({
  providers: [DrizzleService],
  exports: [DrizzleService],
})
export class DatabaseModule {}
