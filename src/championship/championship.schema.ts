import { z } from 'zod'

export const getChampionshipsQuerySchema = z.object({
  search: z.string().optional(),
  year: z.number().optional(),
  country: z.string().optional(),
  favorited: z.enum(['true', 'false']).optional(),
  page: z.number().optional(),
})

export type GetChampionshipsQuery = z.infer<typeof getChampionshipsQuerySchema>

export const getChampionshipBySlugParamsSchema = z.object({
  slug: z.string(),
})

export type GetChampionshipBySlugParams = z.infer<typeof getChampionshipBySlugParamsSchema>

export const getChampionshipTeamsParamsSchema = getChampionshipBySlugParamsSchema

export type GetChampionshipTeamsParams = z.infer<typeof getChampionshipTeamsParamsSchema>

export const getChampionshipTeamsQuerySchema = z.object({
  search: z.string().optional(),
})

export type GetChampionshipTeamsQuery = z.infer<typeof getChampionshipTeamsQuerySchema>

export const getChampionshipMatchesParamsSchema = getChampionshipBySlugParamsSchema

export type GetChampionshipMatchesParams = z.infer<typeof getChampionshipMatchesParamsSchema>

export const getChampionshipMatchesQuerySchema = z.object({
  search: z.string().optional(),
  minDate: z.date().optional(),
  maxDate: z.date().optional(),
})

export type GetChampionshipMatchesQuery = z.infer<typeof getChampionshipMatchesQuerySchema>

export const createChampionshipSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters long')
    .max(255, 'Name must be less than 255 characters long'),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters long')
    .max(255, 'Slug must be less than 255 characters long')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug must be lowercase and can only contain letters, numbers, and dashes'
    ),
  season: z.string().regex(/^\d{4}(-\d{4})?$/, 'Season must be in the format YYYY or YYYY-YYYY'),
  countrySlug: z.string().optional(),
})
export type CreateChampionshipBody = z.infer<typeof createChampionshipSchema>
