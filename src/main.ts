import { NestFactory, Reflector } from '@nestjs/core'
import { AppModule } from './app.module'
import { AuthGuard } from './auth/auth.guard'
import { SessionService } from './auth/session/session.service'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalGuards(new AuthGuard(app.get(SessionService), app.get(Reflector)))

  app.enableCors({
    origin: '*',
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Refresh-Token'],
    exposedHeaders: ['Authorization', 'X-Refresh-Token'],
  })

  await app.listen(process.env.PORT ?? 3000)
}

void bootstrap()
