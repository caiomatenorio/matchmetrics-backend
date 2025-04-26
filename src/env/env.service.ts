import { Injectable, OnApplicationBootstrap } from '@nestjs/common'
import { envSchema } from './env.schema'
import { ConfigService } from '@nestjs/config'
import { SafeParseError } from 'zod'

@Injectable()
export class EnvService implements OnApplicationBootstrap {
  constructor(private readonly configService: ConfigService) {}

  onApplicationBootstrap() {
    this.validateEnv()
  }

  private validateEnv() {
    const parsedEnv = envSchema.safeParse(process.env)

    if (!parsedEnv.success) {
      const errors = this.formatErrorMessage(parsedEnv)

      console.error('\nInvalid environment variables:\n\n' + errors)
      process.exit(1)
    }
  }

  private formatErrorMessage(spe: SafeParseError<{ [k: string]: any }>): string {
    return Object.entries(spe.error.flatten().fieldErrors)
      .map(([key, values]) => (values ? `- ${key}: ${values.join('; ')}` : undefined))
      .join('.\n')
      .concat('.')
  }

  get databaseUrl(): string {
    return this.configService.getOrThrow<string>('DATABASE_URL')
  }

  get jwtSecret(): string {
    return this.configService.getOrThrow<string>('JWT_SECRET')
  }

  get rootEmail(): string {
    return this.configService.getOrThrow<string>('ROOT_EMAIL')
  }

  get rootPassword(): string {
    return this.configService.getOrThrow<string>('ROOT_PASSWORD')
  }

  get port(): number {
    return this.configService.get<number>('PORT') ?? 3000
  }
}
