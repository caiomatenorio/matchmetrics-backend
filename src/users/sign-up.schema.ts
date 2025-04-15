import { z } from 'zod'

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(255, 'Password must be at most 255 characters long')
    .regex(/.*[A-Z].*/, 'Password must have at least one uppercase letter')
    .regex(/.*[a-z].*/, 'Password must have at least one lowercase letter')
    .regex(/.*\d.*/, 'Password must have at least one digit')
    .regex(
      /.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?].*/,
      'Password must have at least one special character (!@#$%^&*()_+-=[]{};\':"\\|,.<>/?)'
    ),
})

export type SignUpInput = z.infer<typeof signUpSchema>

export default signUpSchema
