import { z } from 'zod';

import { s_CreateUser } from '../schemas';

export type CreateScimUserDto = z.infer<typeof s_CreateUser>;
