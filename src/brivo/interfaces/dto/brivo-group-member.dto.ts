import { z } from 'zod';

import { brivoGroupMemberSchema } from '../schemas/brivo-group.schema';

export type BrivoGroupMemberDto = z.infer<typeof brivoGroupMemberSchema>;
