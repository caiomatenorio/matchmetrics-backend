import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { GetChampionshipMatchesQuery, GetChampionshipsQuery } from './championship.schema'
import { Championship, Match, Team } from 'generated/prisma'
import { AuthService } from 'src/auth/auth.service'
import { Request } from 'express'
import ParameterRequiresAuthException from 'src/common/exceptions/parameter-requires-auth.exception'
import ChampionshipNotFoundException from 'src/common/exceptions/championship-not-found.exception'
import ChampionshipAlreadyExistsException from 'src/common/exceptions/championship-already-exists.exception'
import { CountryService } from 'src/country/country.service'
import CountryNotFoundException from 'src/common/exceptions/country-not-found.exception'
import TransactionablePrismaClient from 'src/common/util/transaction-prisma-client'

type ChampionshipWithUsersThatFavorited = Championship & { usersThatFavorited: { id: string }[] }
type ChampionshipWithFavoritedStatus = Championship & { favorited: boolean }

@Injectable()
export class ChampionshipService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly authService: AuthService,
    private readonly countryService: CountryService
  ) {}

  /**
   * Filter championships by year. The year must be between the start and end of the season.
   * @param championships - Array of championships to filter
   * @param year - Year to filter by
   * @returns championships that match the year
   */
  private filterChampionshipsByYear(
    championships: ChampionshipWithUsersThatFavorited[],
    year: number
  ): ChampionshipWithUsersThatFavorited[] {
    return championships.filter(championship => {
      try {
        const seasonStart = championship.season.split('-')[0] // Get the first part of the season (YYYY)
        const seasonEnd = championship.season.split('-')[1] ?? championship.season.split('-')[0] // Get the second part of the season (YYYY) or use the first part if it doesn't exist

        return year >= parseInt(seasonStart) && year <= parseInt(seasonEnd)
      } catch {
        return false // If the season is not in the expected format, exclude it
      }
    })
  }

  /**
   * Attach the favorited status to various championships and remove the usersThatFavorited field.
   * If the userId is not provided, all championships will have favorited set to false.
   * @param championships - Array of championships to attach the favorited status to
   * @param userId - ID of the user to check if they favorited the championship
   * @returns championships with the favorited status attached
   */
  private attachFavoritedStatusToChampionships(
    championships: ChampionshipWithUsersThatFavorited[],
    userId?: string
  ): ChampionshipWithFavoritedStatus[] {
    return championships.map(championship => ({
      ...championship,
      favorited: userId ? championship.usersThatFavorited.some(user => user.id === userId) : false,
    }))
  }

  /**
   * Filter championships by their favorited status.
   * @param championships - Array of championships to filter
   * @param favorited - 'true' to get only favorited championships, 'false' to get only non-favorited championships, undefined to get all championships
   * @returns championships that match the favorited status
   */
  private filterChampionshipsByFavoritedStatus(
    championships: ChampionshipWithFavoritedStatus[],
    favorited?: 'true' | 'false'
  ): ChampionshipWithFavoritedStatus[] {
    return championships.filter(championship => {
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

  /**
   * Get all championships with optional filters for year, country, and favorited status. Also
   * supports searching by name and pagination.
   * @param request - Express request object for authentication
   * @param query - Query parameters for filtering and pagination
   * @param query.search - Search term for championship name
   * @param query.year - Year to filter championships by
   * @param query.country - Country slug to filter championships by
   * @param query.favorited - 'true' to get only favorited championships, 'false' to get only non-favorited championships
   * @param query.page - Page number for pagination
   * @returns Array of championships with optional favorited status
   * @throws ParameterRequiresAuthException if the favorited parameter is used without authentication
   */
  async getAllChampionships(
    request: Request,
    query: GetChampionshipsQuery
  ): Promise<ChampionshipWithFavoritedStatus[]> {
    const { search, year, country, favorited, page } = query

    let championships = await this.prismaService.championship.findMany({
      where: {
        name: { contains: search, mode: 'insensitive' }, // Case insensitive search by name
        country: country ? { slug: country } : undefined, // Filter by country slug
      },

      // Include ids of users that favorited the championship
      include: { usersThatFavorited: { select: { id: true } } },

      // Pagination
      take: page ? 10 : undefined,
      skip: page ? (page - 1) * 10 : undefined,

      orderBy: { name: 'asc' }, // Order by start date in descending order
    })

    if (year) championships = this.filterChampionshipsByYear(championships, year)

    const isAuthenticated = await this.authService.getAuthStatus(request)

    if (!isAuthenticated) {
      if (favorited) throw new ParameterRequiresAuthException('favorited')
      return this.attachFavoritedStatusToChampionships(championships)
    }

    const { id: userId } = await this.authService.whoAmI(request)

    return this.filterChampionshipsByFavoritedStatus(
      this.attachFavoritedStatusToChampionships(championships, userId)
    )
  }

  /**
   * Get a championship by its slug.
   * @param slug - Slug of the championship
   * @returns The championship object
   * @throws ChampionshipNotFoundException if the championship does not exist
   */
  async getChampionshipBySlug(slug: string): Promise<Championship> {
    const championship = await this.prismaService.championship.findUnique({ where: { slug } })

    if (!championship) throw new ChampionshipNotFoundException()

    return championship
  }

  /**
   * Check if a championship exists in the database.
   * @param slug - Slug of the championship
   * @param tpc - TransactionablePrismaClient instance for transaction management, optional
   * @returns true if the championship exists, false otherwise
   */
  private async championshipExists(
    slug: string,
    tpc?: TransactionablePrismaClient
  ): Promise<boolean> {
    const exists = await this.prismaService
      .checkTransaction(tpc)
      .championship.findUnique({ where: { slug } })

    return !!exists
  }

  /**
   * Create a new championship. If a country slug is provided, it will connect the championship to the country.
   * @param name - Name of the championship
   * @param slug - Slug of the championship, must be unique
   * @param season - Season of the championship (e.g., '2023-2024' or '2023')
   * @param countrySlug - Slug of the country to connect the championship to (optional)
   * @throws ChampionshipAlreadyExistsException if the championship already exists
   * @throws CountryNotFoundException if the country slug is provided but the country does not exist
   */
  async createChampionship(
    name: string,
    slug: string,
    season: string,
    countrySlug?: string
  ): Promise<void> {
    await this.prismaService.$transaction(async prisma => {
      if (await this.championshipExists(slug, prisma))
        throw new ChampionshipAlreadyExistsException()

      if (countrySlug && !(await this.countryService.countryExists(countrySlug, prisma)))
        throw new CountryNotFoundException()

      await prisma.championship.create({
        data: {
          name,
          slug,
          season,
          country: countrySlug ? { connect: { slug: countrySlug } } : undefined, // Connect to country if provided
        },
      })
    })
  }

  async getChampionshipTeams(championshipSlug: string, search?: string): Promise<Team[]> {
    const { teams } =
      (await this.prismaService.championship.findUnique({
        where: { slug: championshipSlug }, // Find championship by slug
        select: { teams: search ? { where: { name: { contains: search } } } : true }, // Select teams with optional search filter
      })) ?? {}

    if (!teams) throw new ChampionshipNotFoundException()

    return teams
  }

  async getChampionshipMatches(
    championshipSlug: string,
    query: GetChampionshipMatchesQuery
  ): Promise<Match[]> {
    const { search, minDate, maxDate } = query

    const { matches } =
      (await this.prismaService.championship.findUnique({
        where: { slug: championshipSlug }, // Find championship by slug

        select: {
          matches:
            search || minDate || maxDate
              ? // If a filter is provided, apply it to the matches
                {
                  where: {
                    OR: [
                      { homeTeam: { name: { contains: search } } }, // Search by home team name
                      { awayTeam: { name: { contains: search } } }, // Search by away team name
                    ],

                    date: {
                      gte: minDate, // Filter by minimum date
                      lte: maxDate, // Filter by maximum date
                    },
                  },
                }
              : // Otherwise, select all matches
                true,
        },
      })) ?? {}

    if (!matches) throw new ChampionshipNotFoundException()

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return matches
  }
}
