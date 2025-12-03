import { ConfigType, registerAs } from '@nestjs/config';

export const brivoConfig = registerAs('brivo', () => ({
  apiUrl: process.env.BRIVO_API_URL ?? 'https://api.brivo.com',
  authUrl: process.env.BRIVO_AUTH_URL ?? 'https://auth.brivo.com',
  apiKey: process.env.BRIVO_API_KEY!,
  clientId: process.env.BRIVO_CLIENT_ID!,
  clientSecret: process.env.BRIVO_CLIENT_SECRET!,
  username: process.env.BRIVO_USERNAME!,
  password: process.env.BRIVO_PASSWORD!,
}));

export type BrivoConfig = ConfigType<typeof brivoConfig>;
