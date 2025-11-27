import { z } from 'zod';

import { s_ListResponse } from '../schemas';

export type ScimListDto = z.infer<typeof s_ListResponse>;
