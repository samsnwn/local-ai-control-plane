import { Module } from '@nestjs/common';
import { MtlsGuard } from './mtls.guard.js';

@Module({
  providers: [MtlsGuard],
  exports: [MtlsGuard],
})
export class AuthModule {}
