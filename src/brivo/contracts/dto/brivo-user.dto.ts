import { z } from 'zod';

import { BrivoUserSchema } from '../schemas';

export type BrivoUserDto = z.infer<typeof BrivoUserSchema>;
