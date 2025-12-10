import { z } from 'zod';

import { s_User } from '../schemas';

export type ScimUserDto = z.input<typeof s_User>;
