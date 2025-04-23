import { Module } from '@nestjs/common'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'
import { ScheduleModule } from '@nestjs/schedule'
import { ChampionshipsModule } from './championships/championships.module'
import { AdminModule } from './admin/admin.module'

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    ScheduleModule.forRoot(),
    ChampionshipsModule,
    AdminModule,
  ],
})
export class AppModule {}
