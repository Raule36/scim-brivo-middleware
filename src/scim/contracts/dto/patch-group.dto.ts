import { z } from 'zod';

import { s_Patch } from '../schemas';

export type PatchGroupDto = z.infer<typeof s_Patch>;
