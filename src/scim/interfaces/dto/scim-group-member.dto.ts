import { z } from 'zod';

import { s_GroupMember } from '../schemas';

export type ScimGroupMemberDto = z.infer<typeof s_GroupMember>;
