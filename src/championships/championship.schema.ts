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
