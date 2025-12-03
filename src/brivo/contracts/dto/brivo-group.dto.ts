import { z } from 'zod';

import { BrivoGroupSchema, BrivoGroupWithMembersSchema } from '../schemas';

export type BrivoGroupDto = z.infer<typeof BrivoGroupSchema>;
export type BrivoGroupWithMembersDto = z.infer<typeof BrivoGroupWithMembersSchema>;
