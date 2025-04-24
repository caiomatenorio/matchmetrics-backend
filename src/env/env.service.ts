import { Injectable, OnApplicationBootstrap } from '@nestjs/common'
import { envSchema } from './env.schema'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class EnvService implements OnApplicationBootstrap {
  constructor(private readonly configService: ConfigService) {}

  onApplicationBootstrap() {
    this.validateEnv()
  }

  private validateEnv() {
    const parsedEnv = envSchema.safeParse(process.env)

    if (!parsedEnv.success) {
      console.error('Invalid environment variables:\n' + JSON.stringify(parsedEnv.error.format()))
      process.exit(1)
    }
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
    return this.configService.getOrThrow<number>('PORT')
  }
}
