import { BrivoModule } from '@brivo';
import { Module } from '@nestjs/common';
import { ScimModule } from '@scim';

import { CoreModule } from './core';
import { HealthModule } from './health/health.module';

@Module({
  imports: [CoreModule.forRoot(), ScimModule, BrivoModule, HealthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
