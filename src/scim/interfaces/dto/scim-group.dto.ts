import { z } from 'zod';

import { s_Group } from '../schemas';

export type ScimGroupDto = z.infer<typeof s_Group>;
