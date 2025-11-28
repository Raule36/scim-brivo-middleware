import { z } from 'zod';

export const BrivoUserSchema = z.object({
  id: z.number(),

  firstName: z.string(),
  lastName: z.string(),
  middleName: z.string().optional(),

  created: z.string(),
  updated: z.string(),

  emails: z
    .array(
      z.object({
        address: z.string().optional(),
        type: z.enum(['Work', 'Home']),
      }),
    )
    .default([]),
  phoneNumbers: z
    .array(
      z.object({
        number: z.string(),
        type: z.enum(['Work', 'Home']),
      }),
    )
    .default([]),

  externalId: z.string().optional(),

  suspended: z.boolean().optional(),

  customFields: z.array(z.union([z.string(), z.number(), z.boolean()])).optional(),
});

export type BrivoUserDto = z.infer<typeof BrivoUserSchema>;
