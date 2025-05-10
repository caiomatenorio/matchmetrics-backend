import { z } from 'zod'

export const createMatchSchema = z.object({
  championshipSlug: z.string(),

  homeTeam: z.object({
    slug: z.string(),

    goals: z
      .number()
      .int('Home team goals must be an integer')
      .lte(0, 'Home team goals must be a positive integer'),

    penalties: z
      .number()
      .int('Home team penalties must be an integer')
      .lte(0, 'Home team penalties must be a positive integer')
      .optional(),
  }),

  awayTeam: z.object({
    slug: z.string(),

    goals: z
      .number()
      .int('Away team goals must be an integer')
      .lte(0, 'Away team goals must be a positive integer'),

    penalties: z
      .number()
      .int('Away team penalties must be an integer')
      .lte(0, 'Away team penalties must be a positive integer')
      .optional(),
  }),

  date: z.date(),
})

export type CreateMatchBody = z.infer<typeof createMatchSchema>
