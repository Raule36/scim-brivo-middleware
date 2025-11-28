import { z } from 'zod';

export const brivoGroupBaseSchema = z.object({
  name: z.string().max(255),
  antipassbackResetTime: z.number().int().min(0).max(1440).nullable().optional(),
  keypadUnlock: z.boolean().optional(),
  immuneToAntipassback: z.boolean().optional(),
  excludedFromLockdown: z.boolean().optional(),
});

export const brivoGroupMemberSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  externalId: z.string().nullable().optional(),
});

export const brivoGroupSchema = brivoGroupBaseSchema.extend({
  id: z.number(),
});

export const brivoGroupWithMembersSchema = brivoGroupSchema.extend({
  members: z.array(brivoGroupMemberSchema),
});
