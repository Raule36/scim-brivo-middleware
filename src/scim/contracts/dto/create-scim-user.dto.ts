import { z } from 'zod';

import { s_CreateUser } from '../schemas';

export type CreateScimUserDto = z.input<typeof s_CreateUser>;
