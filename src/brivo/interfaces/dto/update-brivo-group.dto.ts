import { z } from 'zod';

import { brivoGroupBaseSchema } from '../schemas/brivo-group.schema';

export type UpdateBrivoGroupDto = z.infer<typeof brivoGroupBaseSchema>;
