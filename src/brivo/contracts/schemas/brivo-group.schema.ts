import { z } from 'zod';

export const BrivoGroupBaseSchema = z.object({
  name: z.string().max(255),
  antipassbackResetTime: z.number().int().min(0).max(1440).nullable().optional(),
  keypadUnlock: z.boolean().optional(),
  immuneToAntipassback: z.boolean().optional(),
  excludedFromLockdown: z.boolean().optional(),
});

export const BrivoGroupMemberSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  externalId: z.string().nullable().optional(),
});

export const BrivoGroupSchema = BrivoGroupBaseSchema.extend({
  id: z.number(),
});

export const BrivoGroupWithMembersSchema = BrivoGroupSchema.extend({
  members: z.array(BrivoGroupMemberSchema),
});
