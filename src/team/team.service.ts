import { Injectable } from '@nestjs/common'
import TeamSlugAlreadyInUseException from 'src/common/exceptions/team-slug-already-in-use.exception'
import TransactionablePrismaClient from 'src/common/util/transaction-prisma-client'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class TeamService {
  constructor(private readonly prismaService: PrismaService) {}

  async teamExists(slug: string, tpc?: TransactionablePrismaClient): Promise<boolean> {
    const exists = await this.prismaService
      .checkTransaction(tpc)
      .team.findUnique({ where: { slug } })

    return !!exists
  }

  async createTeam(name: string, slug: string, shield: string): Promise<void> {
    await this.prismaService.$transaction(async tpc => {
      if (await this.teamExists(slug, tpc)) throw new TeamSlugAlreadyInUseException()

      await this.prismaService.checkTransaction(tpc).team.create({ data: { name, slug, shield } })
    })
  }
}
