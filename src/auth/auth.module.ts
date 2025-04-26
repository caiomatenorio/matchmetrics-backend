import { forwardRef, Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { SessionService } from './session/session.service'
import { RefreshTokenService } from './refresh-token/refresh-token.service'
import { JwtService } from './jwt/jwt.service'
import { JwtModule } from '@nestjs/jwt'
import { PrismaModule } from 'src/prisma/prisma.module'
import { UserModule } from 'src/user/user.module'
import { SignUpController } from './sign-up/sign-up.controller'
import { LogInController } from './log-in/log-in.controller'
import { LogOutController } from './log-out/log-out.controller'
import { WhoamiController } from './whoami/whoami.controller'
import { StatusController } from './status/status.controller'
import { EnvService } from 'src/env/env.service'

@Module({
  imports: [
    JwtModule.registerAsync({
      global: false,
      inject: [EnvService],
      useFactory: (envService: EnvService) => ({
        secret: envService.jwtSecret,
        signOptions: { expiresIn: '5m' },
      }),
    }),
    PrismaModule,
    forwardRef(() => UserModule),
  ],
  providers: [AuthService, SessionService, RefreshTokenService, JwtService],
  controllers: [
    SignUpController,
    LogInController,
    LogOutController,
    WhoamiController,
    StatusController,
  ],
  exports: [AuthService],
})
export class AuthModule {}
