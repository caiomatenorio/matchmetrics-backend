import { z } from 'zod'

export const getChampionshipsQuerySchema = z.object({
  search: z.string().optional(),
  year: z.number().optional(),
  regionSlug: z.string().optional(),
  favorited: z.enum(['true', 'false']).optional(),
  page: z.number().optional(),
})

export type GetChampionshipsQuery = z.infer<typeof getChampionshipsQuerySchema>

export const getChampionshipBySlugParamsSchema = z.object({
  slug: z.string(),
})

export type GetChampionshipBySlugParams = z.infer<typeof getChampionshipBySlugParamsSchema>

export const getChampionshipMatchesParamsSchema = getChampionshipBySlugParamsSchema

export type GetChampionshipMatchesParams = z.infer<typeof getChampionshipMatchesParamsSchema>

export const getChampionshipMatchesQuerySchema = z.object({
  search: z.string().optional(),
  minDate: z.date().optional(),
  maxDate: z.date().optional(),
  page: z.number().optional(),
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
  regionSlug: z.string(),
})

export type CreateChampionshipBody = z.infer<typeof createChampionshipSchema>

export const updateChampionshipParamsSchema = getChampionshipBySlugParamsSchema

export type UpdateChampionshipParams = z.infer<typeof updateChampionshipParamsSchema>

export const updateChampionshipSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters long')
    .max(255, 'Name must be less than 255 characters long')
    .optional(),
  newSlug: z
    .string()
    .min(3, 'Slug must be at least 3 characters long')
    .max(255, 'Slug must be less than 255 characters long')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug must be lowercase and can only contain letters, numbers, and dashes'
    )
    .optional(),
  season: z
    .string()
    .regex(/^\d{4}(-\d{4})?$/, 'Season must be in the format YYYY or YYYY-YYYY')
    .optional(),
  regionSlug: z.string().optional(),
})

export type UpdateChampionshipBody = z.infer<typeof updateChampionshipSchema>

export const deleteChampionshipParamsSchema = getChampionshipBySlugParamsSchema

export type DeleteChampionshipParams = z.infer<typeof deleteChampionshipParamsSchema>
