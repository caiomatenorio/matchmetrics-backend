import { z } from 'zod'

export const getAllChampionshipsQuerySchema = z.object({
  search: z.string().optional(),
  year: z.number().optional(),
  country: z.string().optional(),
  page: z.number().optional(),
})

export type GetAllChampionshipsQuery = z.infer<typeof getAllChampionshipsQuerySchema>
