import { BrivoApiClient } from '@brivo/application';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { BrivoHttpClient, BrivoMockClient } from '../http';

@Injectable()
export class BrivoApiClientFactory {
  constructor(
    private readonly config: ConfigService,
    private readonly mock: BrivoMockClient,
    private readonly http: BrivoHttpClient,
  ) {}

  public create(): BrivoApiClient {
    const mode = this.config.get<'MOCK' | 'HTTP'>('BRIVO_MODE');
    return mode === 'HTTP' ? this.http : this.mock;
  }
}
