import { BrivoModule } from '@brivo';
import { Module } from '@nestjs/common';
import { ScimModule } from '@scim';

import { CoreModule } from './core';

@Module({
  imports: [CoreModule.forRoot(), ScimModule, BrivoModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
