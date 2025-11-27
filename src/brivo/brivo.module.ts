import { Module } from '@nestjs/common';

import { BrivoClientFactory, BrivoMockAdapter } from './adapters';
import { BrivoClient } from './interfaces';
import { PersistenceModule } from './persistence/persistence.module';

@Module({
  imports: [PersistenceModule],
  exports: [PersistenceModule, BrivoClient],
  providers: [
    BrivoMockAdapter,
    BrivoClientFactory,
    {
      provide: BrivoClient,
      useFactory: (factory: BrivoClientFactory) => factory.create(),
      inject: [BrivoClientFactory],
    },
  ],
})
export class BrivoModule {}
