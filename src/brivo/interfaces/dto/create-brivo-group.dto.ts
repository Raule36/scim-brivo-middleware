import { z } from 'zod';

import { brivoGroupBaseSchema } from '../schemas/brivo-group.schema';

export type CreateBrivoGroupDto = z.infer<typeof brivoGroupBaseSchema>;
