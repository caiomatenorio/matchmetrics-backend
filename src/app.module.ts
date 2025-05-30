import { Module } from '@nestjs/common'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'
import { ScheduleModule } from '@nestjs/schedule'
import { ChampionshipModule } from './championship/championship.module'
import { AdminModule } from './admin/admin.module'
import { ConfigModule } from '@nestjs/config'
import { EnvModule } from './env/env.module'
import { RegionModule } from './region/region.module'
import { TeamModule } from './team/team.module'
import { MatchModule } from './match/match.module'

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    ScheduleModule.forRoot(),
    ChampionshipModule,
    AdminModule,
    EnvModule,
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env'] }),
    RegionModule,
    TeamModule,
    MatchModule,
  ],
})
export class AppModule {}
