import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { GetChampionshipMatchesQuery, GetChampionshipsQuery } from './championship.schema'
import { Championship, Region, Match, Team } from 'generated/prisma'
import { AuthService } from 'src/auth/auth.service'
import { Request } from 'express'
import ParameterRequiresAuthException from 'src/common/exceptions/parameter-requires-auth.exception'
import ChampionshipNotFoundException from 'src/common/exceptions/championship-not-found.exception'
import ChampionshipAlreadyExistsException from 'src/common/exceptions/championship-already-exists.exception'
import RegionNotFoundException from 'src/common/exceptions/country-not-found.exception'
import TransactionablePrismaClient from 'src/common/util/transaction-prisma-client'
import { RegionService } from 'src/region/region.service'

export type ChampionshipWithRegion = Omit<Championship, 'regionSlug'> & {
  region: Region | null
}

type ChampionshipWithCountryAndUsersThatFavorited = ChampionshipWithRegion & {
  usersThatFavorited: { id: string }[]
}

export type ChampionshipWithCountryAndFavoritedStatus = ChampionshipWithRegion & {
  favorited: boolean
}

export type MatchWithTeams = Omit<Match, 'homeTeamSlug' | 'awayTeamSlug'> & {
  homeTeam: Team
  awayTeam: Team
}

@Injectable()
export class ChampionshipService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly authService: AuthService,
    private readonly regionService: RegionService
  ) {}

  /**
   * Filter championships by year. The year must be between the start and end of the season.
   * @param championships - Array of championships to filter
   * @param year - Year to filter by
   * @returns championships that match the year
   */
  private filterChampionshipsByYear(
    championships: ChampionshipWithCountryAndUsersThatFavorited[],
    year: number
  ): ChampionshipWithCountryAndUsersThatFavorited[] {
    return championships.filter(championship => {
      try {
        // Get the first part of the season (YYYY)
        const seasonStart = championship.season.split('-')[0]
        // Get the second part of the season (YYYY) or use the first part if it doesn't exist
        const seasonEnd = championship.season.split('-')[1] ?? championship.season.split('-')[0]

        return year >= parseInt(seasonStart) && year <= parseInt(seasonEnd)
      } catch {
        console.warn(`Unexpected season format for championship: ${championship.season}`) // Log unexpected season format
        return false // Exclude championships with unexpected season format
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
    championships: ChampionshipWithCountryAndUsersThatFavorited[],
    userId?: string
  ): ChampionshipWithCountryAndFavoritedStatus[] {
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
    championships: ChampionshipWithCountryAndFavoritedStatus[],
    favorited?: 'true' | 'false'
  ): ChampionshipWithCountryAndFavoritedStatus[] {
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
  ): Promise<ChampionshipWithCountryAndFavoritedStatus[]> {
    const { search, year, regionSlug, favorited, page } = query

    let championships: ChampionshipWithCountryAndUsersThatFavorited[] =
      await this.prismaService.championship.findMany({
        where: {
          name: { contains: search, mode: 'insensitive' }, // Case insensitive search by name
          region: regionSlug ? { slug: regionSlug } : undefined, // Filter by country slug
        },

        omit: { regionSlug: true }, // Omit the countrySlug field

        // Include ids of users that favorited the championship and country details
        include: {
          usersThatFavorited: { select: { id: true } },
          region: true,
        },

        // Pagination
        take: page ? 10 : undefined,
        skip: page ? (page - 1) * 10 : undefined,

        orderBy: { name: 'asc' }, // Order by name in ascending order
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
  async getChampionshipBySlug(slug: string): Promise<ChampionshipWithRegion> {
    const championship = await this.prismaService.championship.findUnique({
      where: { slug }, // Find championship by slug
      omit: { regionSlug: true }, // Omit the countrySlug field
      include: { region: true }, // Include country details
    })

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
    const exists = await this.prismaService.checkTransaction(tpc).championship.findUnique({
      where: { slug },
      select: { id: true }, // Select only the id field to check existence
    })

    return !!exists
  }

  /**
   * Get all matches in a championship, optionally filtered by search term and date range.
   * @param championshipSlug - Slug of the championship
   * @param query - Query parameters for filtering matches
   * @param query.search - Optional search term for team name
   * @param query.minDate - Optional minimum date for filtering matches
   * @param query.maxDate - Optional maximum date for filtering matches
   * @returns Array of matches in the championship
   * @throws {ChampionshipNotFoundException} if the championship does not exist
   */
  async getChampionshipMatches(
    championshipSlug: string,
    query: GetChampionshipMatchesQuery
  ): Promise<MatchWithTeams[]> {
    const { search, minDate, maxDate, page } = query

    const { matches } =
      (await this.prismaService.championship.findUnique({
        where: { slug: championshipSlug }, // Find championship by slug

        select: {
          matches: {
            omit: { homeTeamSlug: true, awayTeamSlug: true }, // Omit the team slugs

            include: { homeTeam: true, awayTeam: true },

            where:
              search || minDate || maxDate
                ? {
                    OR: [
                      { homeTeam: { name: { contains: search } } }, // Search by home team name
                      { awayTeam: { name: { contains: search } } }, // Search by away team name
                    ],

                    date: {
                      gte: minDate, // Filter by minimum date
                      lte: maxDate, // Filter by maximum date
                    },
                  }
                : undefined,

            take: page ? 10 : undefined, // Pagination
            skip: page ? (page - 1) * 10 : undefined, // Pagination

            orderBy: { date: 'desc' }, // Order by date in descending order
          },
        },
      })) ?? {}

    if (!matches) throw new ChampionshipNotFoundException()

    return matches
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
    regionSlug: string
  ): Promise<void> {
    await this.prismaService.$transaction(async tpc => {
      if (await this.championshipExists(slug, tpc)) throw new ChampionshipAlreadyExistsException()

      if (!(await this.regionService.regionExists(regionSlug, tpc)))
        throw new RegionNotFoundException()

      await tpc.championship.create({
        data: {
          name,
          slug,
          season,
          region: { connect: { slug: regionSlug } },
        },
      })
    })
  }

  async updateChampionship(
    slug: string,
    name?: string,
    newSlug?: string,
    season?: string,
    regionSlug?: string
  ): Promise<void> {
    await this.prismaService.$transaction(async tpc => {
      const championship = await this.prismaService
        .checkTransaction(tpc)
        .championship.findUnique({ where: { slug } })

      if (!championship) throw new ChampionshipNotFoundException()

      if (regionSlug && !(await this.regionService.regionExists(regionSlug, tpc)))
        throw new RegionNotFoundException()

      await this.prismaService.checkTransaction(tpc).championship.update({
        where: { slug },

        data: {
          name,
          slug: newSlug,
          season,
          region: regionSlug ? { connect: { slug: regionSlug } } : undefined,
        },
      })
    })
  }
}
