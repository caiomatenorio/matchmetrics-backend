import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { GetAllChampionshipsQuery } from './championship.schema'
import { Championship } from 'generated/prisma'

@Injectable()
export class ChampionshipsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllChampionships(
    query: GetAllChampionshipsQuery
  ): Promise<Omit<Championship, 'start' | 'end'>[]> {
    const { search, year, country, page } = query

    const startDate = new Date(year ?? 0, 0)
    const endDate = new Date(year ?? 2100, 0)

    return await this.prismaService.championship.findMany({
      where: {
        name: { contains: search, mode: 'insensitive' }, // Case insensitive search by name
        AND: [{ start: { gte: startDate } }, { end: { lt: endDate } }], // Filter by year
        country: country ? { slug: country } : undefined, // Filter by country slug
      },

      omit: {
        start: true, // Omit start date
        end: true, // Omit end date
      },

      // Pagination
      take: page ? 10 : undefined,
      skip: page ? (page - 1) * 10 : undefined,

      orderBy: { start: 'desc' }, // Order by start date in descending order
    })
  }
}
