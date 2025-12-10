import { BrivoApiException } from '@brivo/application';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

import { BrivoConfig, brivoConfig } from '../config';

interface TokenResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
}

@Injectable()
export class BrivoOAuthService {
  private readonly logger = new Logger(BrivoOAuthService.name);

  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiresAt = 0;
  private readonly tokenBufferSeconds = 10;

  constructor(
    private readonly httpService: HttpService,
    @Inject(brivoConfig.KEY)
    private readonly config: BrivoConfig,
  ) {}

  async getAccessToken(): Promise<string> {
    await this.ensureValidToken();
    return this.accessToken!;
  }

  private async ensureValidToken(): Promise<void> {
    if (this.isTokenExpiringSoon()) {
      if (this.refreshToken) {
        await this.refreshAccessToken();
      } else {
        await this.authenticate();
      }
    }
  }

  private isTokenExpiringSoon(): boolean {
    if (!this.accessToken) return true;
    return Date.now() >= this.tokenExpiresAt - this.tokenBufferSeconds * 1000;
  }

  private async authenticate(): Promise<void> {
    this.logger.log('Authenticating with Brivo API...');
    const tokenData = await this.requestToken({
      grant_type: 'password',
      username: this.config.username,
      password: this.config.password,
    });
    this.setTokenData(tokenData);
    this.logger.log('Successfully authenticated with Brivo API');
  }

  private async refreshAccessToken(): Promise<void> {
    this.logger.debug('Refreshing Brivo access token...');
    try {
      const tokenData = await this.requestToken({
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
      });
      this.setTokenData(tokenData);
      this.logger.debug('Successfully refreshed Brivo access token');
    } catch {
      this.logger.warn('Failed to refresh token, re-authenticating...');
      await this.authenticate();
    }
  }

  private async requestToken(body: Record<string, string | null>): Promise<TokenResponse> {
    const url = `${this.config.authUrl}/oauth/token`;
    const credentials = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString(
      'base64',
    );

    const headers = {
      'Authorization': `Basic ${credentials}`,
      'api-key': this.config.apiKey,
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(body)) {
      if (value) params.append(key, value);
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post<TokenResponse>(url, params.toString(), { headers }),
      );
      return response.data;
    } catch (error) {
      this.handleAuthError(error);
    }
  }

  private setTokenData(tokenData: TokenResponse): void {
    this.accessToken = tokenData.access_token;
    this.refreshToken = tokenData.refresh_token;
    this.tokenExpiresAt = Date.now() + tokenData.expires_in * 1000;
  }

  private handleAuthError(error: unknown): never {
    if (error instanceof AxiosError) {
      const status = error.response?.status ?? 500;
      const data = error.response?.data as Record<string, string> | undefined;
      const message = data?.error_description ?? data?.message ?? error.message;
      this.logger.error(`Brivo auth error [${status}]: ${message}`);
      throw new BrivoApiException(status, message);
    }
    throw error;
  }
}
