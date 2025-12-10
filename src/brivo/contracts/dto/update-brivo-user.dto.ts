import { z } from 'zod/index';

import { BrivoCreateUserSchema } from '../schemas';

export type UpdateBrivoUserDto = z.infer<typeof BrivoCreateUserSchema>;
