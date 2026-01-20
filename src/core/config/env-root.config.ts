import { brivoConfigSchema } from '@brivo/infrastructure';
import { z } from 'zod';

import { envConfigSchema } from './env.config';

const rootEnvSchema = z.intersection(envConfigSchema, brivoConfigSchema);
export type RootEnv = z.infer<typeof rootEnvSchema>;

export function validateEnv(config: Record<string, unknown>): RootEnv {
  const result = rootEnvSchema.safeParse(config);

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    throw new Error(`Environment validation failed:\n${formatted}`);
  }

  return result.data;
}
