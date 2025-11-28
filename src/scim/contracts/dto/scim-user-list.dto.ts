import { z } from 'zod';

import { s_UsersListing } from '../schemas';

export type ScimUserListDto = z.infer<typeof s_UsersListing>;
