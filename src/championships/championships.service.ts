import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { GetChampionshipsQuery } from './championship.schema'
import { Championship } from 'generated/prisma'
import { AuthService } from 'src/auth/auth.service'
import { Request } from 'express'
import ParameterRequiresAuthException from 'src/common/exceptions/parameter-requires-auth.exception'
import ChampionshipNotFoundException from 'src/common/exceptions/championship-not-found.exception'
import ChampionshipAlreadyExistsException from 'src/common/exceptions/championship-already-exists.exception'

@Injectable()
export class ChampionshipsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly authService: AuthService
  ) {}

  async getAllChampionships(
    request: Request,
    query: GetChampionshipsQuery
  ): Promise<(Championship & { favorited: boolean })[]> {
    const { search, year, country, favorited, page } = query

    let championships = await this.prismaService.championship.findMany({
      where: {
        name: { contains: search, mode: 'insensitive' }, // Case insensitive search by name
        country: country ? { slug: country } : undefined, // Filter by country slug
      },

      // Include ids of users that favorited the championship
      include: { usersThatFavorited: { omit: { createdAt: true, email: true, password: true } } },

      // Pagination
      take: page ? 10 : undefined,
      skip: page ? (page - 1) * 10 : undefined,

      orderBy: { name: 'asc' }, // Order by start date in descending order
    })

    if (year) {
      championships = championships.filter(championship => {
        try {
          const seasonStart = championship.season.split('-')[0] // Get the first part of the season (YYYY)
          const seasonEnd = championship.season.split('-')[1] ?? championship.season.split('-')[0] // Get the second part of the season (YYYY) or use the first part if it doesn't exist

          return year >= parseInt(seasonStart) && year <= parseInt(seasonEnd)
        } catch {
          return false // If the season is not in the expected format, exclude it
        }
      })
    }

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

  async getChampionshipBySlug(slug: string): Promise<Championship> {
    const championship = await this.prismaService.championship.findUnique({ where: { slug } })

    if (!championship) throw new ChampionshipNotFoundException()

    return championship
  }

  async championshipExists(slug: string): Promise<boolean> {
    try {
      await this.getChampionshipBySlug(slug)
      return true
    } catch (error) {
      if (error instanceof ChampionshipNotFoundException) return false
      throw error
    }
  }

  async createChampionship(
    name: string,
    slug: string,
    season: string,
    countrySlug?: string
  ): Promise<void> {
    if (await this.championshipExists(slug)) throw new ChampionshipAlreadyExistsException()

    await this.prismaService.championship.create({
      data: {
        name,
        slug,
        season,
        country: countrySlug ? { connect: { slug: countrySlug } } : undefined, // Connect to country if provided
      },
    })
  }
}
