import { z } from 'zod';

import { s_CreateUser } from '../schemas';

export type UpdateScimUserDto = z.input<typeof s_CreateUser>;
