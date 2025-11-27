import { z } from 'zod';

import { BrivoUserSchema } from './brivo-user.dto';

export const BrivoCreateUserSchema = BrivoUserSchema.omit({
  id: true,
  created: true,
  updated: true,
});

export type CreateBrivoUserDto = z.infer<typeof BrivoCreateUserSchema>;
