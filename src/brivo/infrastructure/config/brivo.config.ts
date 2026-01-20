import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const brivoBaseConfigSchema = z.object({
  BRIVO_API_URL: z.string().url(),
  BRIVO_AUTH_URL: z.string().url(),
  BRIVO_API_KEY: z.string(),
  BRIVO_CLIENT_ID: z.string(),
  BRIVO_CLIENT_SECRET: z.string(),
  BRIVO_USERNAME: z.string(),
  BRIVO_PASSWORD: z.string(),
});

const brivoHttpSchema = brivoBaseConfigSchema.extend({
  BRIVO_MODE: z.literal('http'),
});

const brivoMockSchema = brivoBaseConfigSchema.partial().extend({
  BRIVO_MODE: z.literal('mock'),
});

export const brivoConfigSchema = z.discriminatedUnion('BRIVO_MODE', [
  brivoMockSchema,
  brivoHttpSchema,
]);

export type BrivoConfig = z.infer<typeof brivoConfigSchema>;
export type BrivoHttpConfig = Extract<BrivoConfig, { BRIVO_MODE: 'http' }>;
export type BrivoMockConfig = Extract<BrivoConfig, { BRIVO_MODE: 'mock' }>;

export const brivoConfig = registerAs('brivo', (): BrivoConfig => {
  return {
    BRIVO_MODE: process.env.BRIVO_MODE,
    BRIVO_API_URL: process.env.BRIVO_API_URL,
    BRIVO_AUTH_URL: process.env.BRIVO_AUTH_URL,
    BRIVO_API_KEY: process.env.BRIVO_API_KEY,
    BRIVO_CLIENT_ID: process.env.BRIVO_CLIENT_ID,
    BRIVO_CLIENT_SECRET: process.env.BRIVO_CLIENT_SECRET,
    BRIVO_USERNAME: process.env.BRIVO_USERNAME,
    BRIVO_PASSWORD: process.env.BRIVO_PASSWORD,
  } as unknown as BrivoConfig;
});
