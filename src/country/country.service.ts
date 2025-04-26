import { Injectable } from '@nestjs/common'
import TransactionPrismaClient from 'src/common/util/transaction-prisma-client'

@Injectable()
export class CountryService {
  /**
   * Check if a country exists in the database. Must be used inside a transaction.
   * @param slug - Slug of the country
   * @param prisma - Prisma client instance inside a transaction
   * @returns true if the country exists, false otherwise
   */
  async countryExistsT(slug: string, prisma: TransactionPrismaClient): Promise<boolean> {
    return !!(await prisma.country.findUnique({ where: { slug } }))
  }
}
