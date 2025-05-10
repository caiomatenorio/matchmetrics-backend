import { Injectable } from '@nestjs/common'
import { ChampionshipService } from 'src/championship/championship.service'
import ChampionshipNotFoundException from 'src/common/exceptions/championship-not-found.exception'
import MatchNotFoundException from 'src/common/exceptions/match-not-found.exception'
import TeamNotFoundException from 'src/common/exceptions/team-not-found.exception'
import TransactionablePrismaClient from 'src/common/util/transaction-prisma-client'
import { PrismaService } from 'src/prisma/prisma.service'
import { TeamService } from 'src/team/team.service'

type TeamInfo = {
  slug: string
  goals: number
  penalties?: number
}

@Injectable()
export class MatchService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly championshipService: ChampionshipService,
    private readonly teamService: TeamService
  ) {}

  async createMatch(
    championshipSlug: string,
    homeTeam: TeamInfo,
    awayTeam: TeamInfo,
    date: Date
  ): Promise<{ id: string }> {
    return await this.prismaService.$transaction(async tpc => {
      if (!(await this.championshipService.championshipExists(championshipSlug, tpc)))
        throw new ChampionshipNotFoundException()

      if (
        !(
          (await this.teamService.teamExists(homeTeam.slug, tpc)) &&
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

  private async matchExists(id: string, tpc?: TransactionablePrismaClient): Promise<boolean> {
    const exists = await this.prismaService
      .checkTransaction(tpc)
      .match.findUnique({ where: { id }, select: { id: true } })

    return !!exists
  }

  async updateMatch(
    id: string,
    championshipSlug?: string,
    homeTeam?: Partial<TeamInfo>,
    awayTeam?: Partial<TeamInfo>,
    date?: Date
  ): Promise<void> {
    this.prismaService.$transaction(async tpc => {
      if (!(await this.matchExists(id, tpc))) throw new MatchNotFoundException()

      if (
        championshipSlug &&
        !(await this.championshipService.championshipExists(championshipSlug, tpc))
      )
        throw new ChampionshipNotFoundException()

      if (
        (homeTeam?.slug && !(await this.teamService.teamExists(homeTeam.slug, tpc))) ||
        (awayTeam?.slug && !(await this.teamService.teamExists(awayTeam.slug, tpc)))
      )
        throw new TeamNotFoundException()

      this.prismaService.checkTransaction(tpc).match.update({
        where: { id },
        data: {
          championship: championshipSlug ? { connect: { slug: championshipSlug } } : undefined,

          homeTeam: homeTeam?.slug ? { connect: { slug: homeTeam.slug } } : undefined,
          homeTeamGoals: homeTeam?.goals,
          homeTeamPenalties: homeTeam?.penalties,

          awayTeam: awayTeam?.slug ? { connect: { slug: awayTeam.slug } } : undefined,
          awayTeamGoals: awayTeam?.goals,
          awayTeamPenalties: awayTeam?.penalties,

          date,
        },
      })
    })
  }
}
