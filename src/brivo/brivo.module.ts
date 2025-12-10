import { BrivoApiClient } from '@brivo/application';
import {
  BrivoApiClientFactory,
  brivoConfig,
  BrivoHttpClient,
  BrivoMockClient,
  BrivoOAuthService,
  PersistenceModule,
} from '@brivo/infrastructure';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PersistenceModule, HttpModule, ConfigModule.forFeature(brivoConfig)],
  exports: [PersistenceModule, BrivoApiClient],
  providers: [
    BrivoMockClient,
    BrivoHttpClient,
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
