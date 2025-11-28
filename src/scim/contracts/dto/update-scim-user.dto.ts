import { z } from 'zod';

import { s_CreateUser } from '../schemas';

export type UpdateScimUserDto = z.infer<typeof s_CreateUser>;
