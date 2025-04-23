import { z } from 'zod'

export const promoteUserParamsSchema = z.object({ email: z.string().email('Invalid email format') })

export type PromoteUserParams = z.infer<typeof promoteUserParamsSchema>
