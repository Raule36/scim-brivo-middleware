import { z } from 'zod';

import { s_GroupsListing } from '../schemas';

export type ScimGroupListDto = z.infer<typeof s_GroupsListing>;
