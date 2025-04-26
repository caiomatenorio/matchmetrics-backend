import { z } from 'zod'

export const envSchema = z.object({
  DATABASE_URL: z.string().url('Invalid database URL'),
  JWT_SECRET: z.string().min(64, 'JWT secret must be at least 64 characters long'),
  ROOT_EMAIL: z.string().email('Invalid root email address'),
  ROOT_PASSWORD: z
    .string()
    .min(8, 'Root password must be at least 8 characters long')
    .max(255, 'Root password must be at most 255 characters long')
    .regex(/.*[A-Z].*/, 'Root password must have at least one uppercase letter')
    .regex(/.*[a-z].*/, 'Root password must have at least one lowercase letter')
    .regex(/.*\d.*/, 'Root password must have at least one digit')
    .regex(
      /.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?].*/,
      'Root password must have at least one special character (!@#$%^&*()_+-=[]{};\':"\\|,.<>/?)'
    ),
  PORT: z.number().default(3000),
})
