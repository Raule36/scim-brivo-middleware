import { BrivoModule } from '@brivo/brivo.module';
import { Module } from '@nestjs/common';
import { ScimModule } from '@scim/scim.module';

import { CoreModule } from './core';

@Module({
  imports: [CoreModule.forRoot(), ScimModule, BrivoModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
