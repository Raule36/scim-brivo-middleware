import { z } from 'zod';

import { s_User } from '../schemas';

export type ScimUserDto = z.infer<typeof s_User>;
