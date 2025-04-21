import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { GetChampionshipsQuery } from './championship.schema'
import { Championship } from 'generated/prisma'
import { AuthService } from 'src/auth/auth.service'
import { Request } from 'express'
import ParameterRequiresAuthException from 'src/common/exceptions/parameter-requires-auth.exception'

@Injectable()
export class ChampionshipsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly authService: AuthService
  ) {}

  private convertYearQueryToDate(year?: number): { startDate: Date; endDate: Date } {
    const startDate = new Date(year ?? 0, 0)
    const endDate = new Date(year ? year + 1 : 2100, 0)

    return { startDate, endDate }
  }

  async getAllChampionships(
    request: Request,
    query: GetChampionshipsQuery
  ): Promise<(Omit<Championship, 'start' | 'end'> & { favorited: boolean })[]> {
    const { search, year, country, favorited, page } = query
    const { startDate, endDate } = this.convertYearQueryToDate(year)

    const championships = await this.prismaService.championship.findMany({
      where: {
        name: { contains: search, mode: 'insensitive' }, // Case insensitive search by name
        AND: [{ start: { gte: startDate } }, { end: { lt: endDate } }], // Filter by year
        country: country ? { slug: country } : undefined, // Filter by country slug
      },

      omit: {
        start: true, // Omit start date
        end: true, // Omit end date
      },

      // Include ids of users that favorited the championship
      include: { usersThatFavorited: { omit: { createdAt: true, email: true, password: true } } },

      // Pagination
      take: page ? 10 : undefined,
      skip: page ? (page - 1) * 10 : undefined,

      orderBy: { start: 'desc' }, // Order by start date in descending order
    })

    const isAuthenticated = await this.authService.getAuthStatus(request)

    if (!isAuthenticated) {
      if (favorited) throw new ParameterRequiresAuthException('favorited')

      return championships.map(championship => ({
        ...championship,
        usersThatFavorited: undefined,
        favorited: false,
      }))
    }

    const { id: userId } = await this.authService.whoAmI(request)

    return championships
      .map(championship => ({
        ...championship,
        usersThatFavorited: undefined,
        favorited: championship.usersThatFavorited.some(user => user.id === userId),
      }))
      .filter(championship => {
        // Filter by favorited status
        switch (favorited) {
          case 'true':
            return championship.favorited
          case 'false':
            return !championship.favorited
          default:
            return true
        }
      })
  }
}
