import { z } from 'zod';

import { BrivoGroupBaseSchema } from '../schemas';

export type UpdateBrivoGroupDto = z.infer<typeof BrivoGroupBaseSchema>;
