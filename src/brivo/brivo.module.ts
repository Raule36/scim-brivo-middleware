import { BrivoApiClient } from '@brivo/application';
import { PersistenceModule } from '@brivo/persistence';
import { Module } from '@nestjs/common';

import { BrivoApiClientFactory, BrivoMockClient } from './infrastructure';

@Module({
  imports: [PersistenceModule],
  exports: [PersistenceModule, BrivoApiClient],
  providers: [
    BrivoMockClient,
    BrivoApiClientFactory,
    {
      provide: BrivoApiClient,
      useFactory: (factory: BrivoApiClientFactory) => factory.create(),
      inject: [BrivoApiClientFactory],
    },
  ],
})
export class BrivoModule {}
