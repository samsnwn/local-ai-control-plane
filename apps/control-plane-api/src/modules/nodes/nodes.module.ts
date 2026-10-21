import { Module } from '@nestjs/common';
import { NodesService } from './nodes.service.js';
import { NodesController } from './nodes.controller.js';
import { DatabaseModule } from '../database/database.module.js';

@Module({
  imports: [DatabaseModule],
  providers: [NodesService],
  controllers: [NodesController],
  exports: [NodesService],
})
export class NodesModule {}
