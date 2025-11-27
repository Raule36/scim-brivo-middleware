import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

interface BasicAuthCredentials {
  username: string;
  password: string;
}

@Injectable()
export class ScimBasicAuthGuard implements CanActivate {
  private static readonly BASIC_PREFIX = 'Basic ';

  constructor(private readonly configService: ConfigService) {}

  public canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader: string | undefined = request.headers.authorization;

    if (!authHeader?.startsWith(ScimBasicAuthGuard.BASIC_PREFIX)) {
      throw new UnauthorizedException('Invalid authorization header');
    }

    const provided: BasicAuthCredentials = this.parseAuthHeader(authHeader);
    const expected: BasicAuthCredentials = this.getExpectedCredentials();

    return provided.username === expected.username && provided.password == expected.password;
  }

  private parseAuthHeader(header: string): BasicAuthCredentials {
    const base64 = header.slice(ScimBasicAuthGuard.BASIC_PREFIX.length).trim();
    const decoded = Buffer.from(base64, 'base64').toString('utf-8');

    const separatorIndex = decoded.indexOf(':');

    if (separatorIndex === -1) {
      throw new UnauthorizedException('Invalid Basic auth format');
    }

    const username = decoded.substring(0, separatorIndex);
    const password = decoded.substring(separatorIndex + 1);

    if (!username || !password) {
      throw new UnauthorizedException('Invalid SCIM credentials');
    }

    return { username, password };
  }

  private getExpectedCredentials(): BasicAuthCredentials {
    const username = this.configService.get<string>('SCIM_BASIC_USERNAME');
    const password = this.configService.get<string>('SCIM_BASIC_PASSWORD');

    if (!username || !password) {
      throw new UnauthorizedException('SCIM credentials not configured');
    }

    return { username, password };
  }
}
