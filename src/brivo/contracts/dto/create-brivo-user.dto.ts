import { z } from 'zod';

import { BrivoCreateUserSchema } from '../schemas';

export type CreateBrivoUserDto = z.infer<typeof BrivoCreateUserSchema>;
