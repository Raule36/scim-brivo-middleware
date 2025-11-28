import { z } from 'zod';

import { s_Group } from '../schemas';

export type UpdateScimGroupDto = Partial<z.infer<typeof s_Group>>;
