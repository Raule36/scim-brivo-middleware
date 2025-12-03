import { z } from 'zod';

import { BrivoGroupBaseSchema } from '../schemas';

export type CreateBrivoGroupDto = z.infer<typeof BrivoGroupBaseSchema>;
