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

export const updateMatchParamsSchema = z.object({
  id: z.string(),
})

export type UpdateMatchParams = z.infer<typeof updateMatchParamsSchema>

export const updateMatchSchema = z.object({
  championshipSlug: z.string().optional(),

  homeTeam: z
    .object({
      slug: z.string().optional(),

      goals: z
        .number()
        .int('Home team goals must be an integer')
        .lte(0, 'Home team goals must be a positive integer')
        .optional(),

      penalties: z
        .number()
        .int('Home team penalties must be an integer')
        .lte(0, 'Home team penalties must be a positive integer')
        .optional(),
    })
    .optional(),

  awayTeam: z
    .object({
      slug: z.string().optional(),

      goals: z
        .number()
        .int('Away team goals must be an integer')
        .lte(0, 'Away team goals must be a positive integer')
        .optional(),

      penalties: z
        .number()
        .int('Away team penalties must be an integer')
        .lte(0, 'Away team penalties must be a positive integer')
        .optional(),
    })
    .optional(),

  date: z.date().optional(),
})

export type UpdateMatchBody = z.infer<typeof updateMatchSchema>

export const deleteMatchParamsSchema = updateMatchParamsSchema

export type DeleteMatchParams = z.infer<typeof deleteMatchParamsSchema>
