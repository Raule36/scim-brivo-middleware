import { z } from 'zod';

import { s_UserEmail } from '../schemas';

export type ScimUserEmailDto = z.infer<typeof s_UserEmail>;
