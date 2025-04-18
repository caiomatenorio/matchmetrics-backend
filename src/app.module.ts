import { Module } from '@nestjs/common'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { ScheduleModule } from '@nestjs/schedule'
import { APP_GUARD } from '@nestjs/core'
import { AuthGuard } from './auth/auth.guard'

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, ScheduleModule.forRoot()],
  providers: [{ provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule {}
