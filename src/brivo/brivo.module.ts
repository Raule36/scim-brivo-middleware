import { BrivoApiClient } from '@brivo/application';
import {
  BrivoApiClientFactory,
  BrivoMockClient,
  BrivoOAuthService,
  PersistenceModule,
} from '@brivo/infrastructure';
import { Module } from '@nestjs/common';

@Module({
  imports: [PersistenceModule],
  exports: [PersistenceModule, BrivoApiClient],
  providers: [
    BrivoMockClient,
    BrivoApiClientFactory,
    BrivoOAuthService,
    {
      provide: BrivoApiClient,
      useFactory: (factory: BrivoApiClientFactory) => factory.create(),
      inject: [BrivoApiClientFactory],
    },
  ],
})
export class BrivoModule {}
