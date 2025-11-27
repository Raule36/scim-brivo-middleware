import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { BrivoClient } from '../interfaces';
import { BrivoMockAdapter } from './brivo-mock.adapter';

@Injectable()
export class BrivoClientFactory {
  constructor(
    private readonly config: ConfigService,
    private readonly mock: BrivoMockAdapter,
  ) {}

  public create(): BrivoClient {
    const mode = this.config.get<'MOCK' | 'HTTP'>('BRIVO_MODE');
    if (mode === 'HTTP') {
      throw new Error('HTTP adapter is not implemented');
    }
    return this.mock;
  }
}
