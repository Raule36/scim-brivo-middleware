import { z } from 'zod/index';

const BrivoEmailSchema = z.object({
  address: z.string().optional(),
  type: z.string(),
});

const BrivoPhoneNumberSchema = z.object({
  number: z.string(),
  type: z.string(),
});

export const BrivoUserSchema = z.object({
  id: z.number(),

  firstName: z.string(),
  lastName: z.string(),
  middleName: z.string().optional(),

  created: z.string(),
  updated: z.string(),

  emails: z.array(BrivoEmailSchema).default([]),
  phoneNumbers: z.array(BrivoPhoneNumberSchema).default([]),

  externalId: z.string().optional(),

  suspended: z.boolean().optional(),

  customFields: z.array(z.union([z.string(), z.number(), z.boolean()])).optional(),
});

export const BrivoCreateUserSchema = BrivoUserSchema.omit({
  id: true,
  created: true,
  updated: true,
});
