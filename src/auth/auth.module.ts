import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { SessionService } from './session/session.service'
import { RefreshTokenService } from './refresh-token/refresh-token.service'
import { JwtService } from './jwt/jwt.service'
import { JwtModule } from '@nestjs/jwt'
import { PrismaModule } from 'src/prisma/prisma.module'

@Module({
  imports: [
    JwtModule.register({
      global: false,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '5m' },
    }),
    PrismaModule,
  ],
  providers: [AuthService, SessionService, RefreshTokenService, JwtService],
  controllers: [AuthController],
})
export class AuthModule {}
