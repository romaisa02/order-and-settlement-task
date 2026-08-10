import { z } from 'zod';

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(100).optional(),
    email: z.string().trim().email('Invalid email').toLowerCase().optional(),
  })
  .refine((data) => data.name !== undefined || data.email !== undefined, {
    message: 'Provide a name or email to update',
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
