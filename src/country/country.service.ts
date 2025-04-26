import { Injectable } from '@nestjs/common'
import TransactionablePrismaClient from 'src/common/util/transaction-prisma-client'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class CountryService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Check if a country exists in the database by its slug.
   * @param slug - The slug of the country to check
   * @param tpc - TransactionablePrismaClient instance for transaction management, optional
   * @returns true if the country exists, false otherwise
   */
  async countryExists(slug: string, tpc?: TransactionablePrismaClient): Promise<boolean> {
    const exists = await this.prismaService
      .checkTransaction(tpc)
      .country.findUnique({ where: { slug } })

    return !!exists
  }
}
