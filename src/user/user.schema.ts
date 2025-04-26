import { z } from 'zod'

export const deleteMeSchema = z.object({
  password: z.string(),
})

export type DeleteMeBody = z.infer<typeof deleteMeSchema>
