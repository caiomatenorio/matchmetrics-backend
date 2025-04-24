import { NestFactory, Reflector } from '@nestjs/core'
import { AppModule } from './app.module'
import { AuthGuard } from './auth/auth.guard'
import { SessionService } from './auth/session/session.service'
import { EnvService } from './env/env.service'
import ExceptionFilter from './exception-filter/exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const sessionService = app.get(SessionService)
  const reflector = app.get(Reflector)
  const envService = app.get(EnvService)

  app.useGlobalFilters(new ExceptionFilter())
  app.useGlobalGuards(new AuthGuard(sessionService, reflector))
  app.enableCors({
    origin: '*',
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Refresh-Token'],
    exposedHeaders: ['Authorization', 'X-Refresh-Token'],
  })

  await app.listen(envService.port)
}

void bootstrap()
