import { BrivoApiException } from '@brivo/application';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { AxiosError, AxiosRequestConfig } from 'axios';
import { firstValueFrom } from 'rxjs';

import { brivoConfig, BrivoHttpConfig } from '../config';
import { BrivoOAuthService } from './brivo-oauth.service';

interface BrivoErrorResponse {
  code: number;
  message: string;
}

@Injectable()
export abstract class BrivoBaseHttpClient {
  private readonly logger = new Logger(BrivoBaseHttpClient.name);

  constructor(
    protected readonly httpService: HttpService,
    @Inject(brivoConfig.KEY) protected readonly config: BrivoHttpConfig,
    private readonly oauthService: BrivoOAuthService,
  ) {}

  protected get<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url: path });
  }

  protected post<T>(path: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url: path, data });
  }

  protected put<T>(path: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url: path, data });
  }

  protected delete<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url: path });
  }

  protected async request<T>(config: AxiosRequestConfig): Promise<T> {
    const accessToken = await this.oauthService.getAccessToken();

    const url = `${this.config.BRIVO_API_URL}/v1/api${config.url}`;
    const headers = {
      ...config.headers,
      'Authorization': `Bearer ${accessToken}`,
      'api-key': this.config.BRIVO_API_KEY,
      'Content-Type': 'application/json',
    };

    try {
      const response = await firstValueFrom(
        this.httpService.request<T>({ ...config, url, headers }),
      );
      return response.data;
    } catch (error) {
      this.handleRequestError(error);
    }
  }

  private handleRequestError(error: unknown): never {
    if (error instanceof AxiosError) {
      const brivoError = error.response?.data as BrivoErrorResponse | undefined;
      const status = error.response?.status ?? error.status ?? 500;
      const message = brivoError?.message ?? error.message;

      this.logger.error(`Brivo API error [${status}]: ${message}`);

      throw new BrivoApiException(status, message);
    }

    throw error;
  }
}
