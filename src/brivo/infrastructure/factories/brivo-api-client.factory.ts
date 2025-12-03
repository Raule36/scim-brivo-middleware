import { BrivoApiClient } from '@brivo/application';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { BrivoMockClient } from '../http/brivo-mock.client';

@Injectable()
export class BrivoApiClientFactory {
  constructor(
    private readonly config: ConfigService,
    private readonly mock: BrivoMockClient,
  ) {}

  public create(): BrivoApiClient {
    const mode = this.config.get<'MOCK' | 'HTTP'>('BRIVO_MODE');
    if (mode === 'HTTP') {
      throw new Error('HTTP adapter is not implemented');
    }
    return this.mock;
  }
}
