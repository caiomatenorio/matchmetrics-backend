import { z } from 'zod'

export const createRegionSchema = z.object({
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

  flag: z.string().url('Flag must be a valid URL'),
})

export type CreateRegionBody = z.infer<typeof createRegionSchema>

export const updateRegionParamsSchema = z.object({
  slug: z.string(),
})

export type UpdateRegionParams = z.infer<typeof updateRegionParamsSchema>

export const updateRegionSchema = z.object({
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

  flag: z.string().url('Flag must be a valid URL').optional(),
})

export type UpdateRegionBody = z.infer<typeof updateRegionSchema>
