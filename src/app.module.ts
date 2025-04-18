import { Module } from '@nestjs/common'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { ScheduleModule } from '@nestjs/schedule'

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, ScheduleModule.forRoot()],
})
export class AppModule {}
