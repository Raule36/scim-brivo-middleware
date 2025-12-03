import { z } from 'zod';

import { BrivoGroupMemberSchema } from '../schemas';

export type BrivoGroupMemberDto = z.infer<typeof BrivoGroupMemberSchema>;
