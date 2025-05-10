import { Module } from '@nestjs/common'
import { MatchService } from './match.service'
import { MatchController } from './match.controller'
import { ChampionshipModule } from 'src/championship/championship.module'
import { TeamModule } from 'src/team/team.module'
import { PrismaModule } from 'src/prisma/prisma.module'

@Module({
  imports: [PrismaModule, ChampionshipModule, TeamModule],
  providers: [MatchService],
  controllers: [MatchController],
})
export class MatchModule {}
