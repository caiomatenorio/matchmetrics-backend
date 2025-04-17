import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { SessionService } from './session/session.service'
import { RefreshTokenService } from './refresh-token/refresh-token.service'
import { JwtService } from './jwt/jwt.service'
import { JwtModule } from '@nestjs/jwt'
import { PrismaModule } from 'src/prisma/prisma.module'
import { UsersModule } from 'src/users/users.module'
import { SignUpController } from './sign-up/sign-up.controller'
import { LogInController } from './log-in/log-in.controller'
import { LogOutController } from './log-out/log-out.controller'

@Module({
  imports: [
    JwtModule.register({
      global: false,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '5m' },
    }),
    PrismaModule,
    UsersModule,
  ],
  providers: [AuthService, SessionService, RefreshTokenService, JwtService],
  controllers: [SignUpController, LogInController, LogOutController],
})
export class AuthModule {}
