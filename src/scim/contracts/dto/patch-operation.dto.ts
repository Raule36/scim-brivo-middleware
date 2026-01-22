import { z } from 'zod';

import { s_PatchOperation } from '../schemas';

export type PatchOperationDto = z.infer<typeof s_PatchOperation>;
