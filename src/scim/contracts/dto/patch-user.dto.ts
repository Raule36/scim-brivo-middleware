import { z } from 'zod';

import { s_Patch } from '../schemas';

export type PatchUserDto = z.infer<typeof s_Patch>;
