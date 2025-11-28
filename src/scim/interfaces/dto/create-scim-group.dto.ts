import { z } from 'zod';

import { s_CreateGroup } from '../schemas';

export type CreateScimGroupDto = z.infer<typeof s_CreateGroup>;
