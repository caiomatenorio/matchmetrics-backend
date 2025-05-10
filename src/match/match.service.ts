import { Injectable } from '@nestjs/common'
import { ChampionshipService } from 'src/championship/championship.service'
import ChampionshipNotFoundException from 'src/common/exceptions/championship-not-found.exception'
import TeamNotFoundException from 'src/common/exceptions/team-not-found.exception'
import { PrismaService } from 'src/prisma/prisma.service'
import { TeamService } from 'src/team/team.service'

@Injectable()
export class MatchService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly championshipService: ChampionshipService,
    private readonly teamService: TeamService
  ) {}

  async createMatch(
    championshipSlug: string,
    homeTeam: { slug: string; goals: number; penalties?: number },
    awayTeam: { slug: string; goals: number; penalties?: number },
    date: Date
  ): Promise<{ id: string }> {
    return await this.prismaService.$transaction(async tpc => {
      if (!(await this.championshipService.championshipExists(championshipSlug, tpc)))
        throw new ChampionshipNotFoundException()

      if (
        !(
          (await this.teamService.teamExists(homeTeam.slug, tpc)) ||
          (await this.teamService.teamExists(awayTeam.slug, tpc))
        )
      )
        throw new TeamNotFoundException()

      return await this.prismaService.checkTransaction(tpc).match.create({
        data: {
          championship: { connect: { slug: championshipSlug } },

          homeTeam: { connect: { slug: homeTeam.slug } },
          homeTeamGoals: homeTeam.goals,
          homeTeamPenalties: homeTeam.penalties,

          awayTeam: { connect: { slug: awayTeam.slug } },
          awayTeamGoals: awayTeam.goals,
          awayTeamPenalties: awayTeam.penalties,

          date,
        },

        select: { id: true },
      })
    })
  }
}
