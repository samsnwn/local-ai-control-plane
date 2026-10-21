import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabaseModule } from './modules/database/database.module.js';
import { NodesModule } from './modules/nodes/nodes.module.js';
import { AuthModule } from './modules/auth/auth.module.js';

@Module({
  imports: [DatabaseModule, NodesModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
