import { z } from 'zod';

import { brivoGroupSchema, brivoGroupWithMembersSchema } from '../schemas/brivo-group.schema';

export type BrivoGroupDto = z.infer<typeof brivoGroupSchema>;
export type BrivoGroupWithMembersDto = z.infer<typeof brivoGroupWithMembersSchema>;
