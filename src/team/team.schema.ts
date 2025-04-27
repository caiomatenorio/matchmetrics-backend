import { z } from 'zod'

export const createTeamSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters long')
    .max(255, 'Name must be at most 255 characters long'),

  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters long')
    .max(255, 'Slug must be at most 255 characters long')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug must be lowercase and can only contain letters, numbers, and dashes'
    ),

  shield: z.string().url('Shield must be a valid URL'),
})

export type CreateTeamBody = z.infer<typeof createTeamSchema>
