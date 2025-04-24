import { Module } from '@nestjs/common'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'
import { ScheduleModule } from '@nestjs/schedule'
import { ChampionshipsModule } from './championships/championships.module'
import { AdminModule } from './admin/admin.module'
import { ConfigModule } from '@nestjs/config'
import { EnvModule } from './env/env.module'

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    ScheduleModule.forRoot(),
    ChampionshipsModule,
    AdminModule,
    EnvModule,
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env'] }),
  ],
})
export class AppModule {}
