import { z } from 'zod';

export const envConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),

  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive(),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_NAME: z.string().min(1),

  SCIM_BASIC_USERNAME: z.string().min(1),
  SCIM_BASIC_PASSWORD: z.string().min(1),
});

export type EnvConfig = z.infer<typeof envConfigSchema>;
