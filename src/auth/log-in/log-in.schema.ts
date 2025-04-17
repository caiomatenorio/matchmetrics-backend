import { z } from 'zod'

export const logInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string(),
})

export type LogInInput = z.infer<typeof logInSchema>
