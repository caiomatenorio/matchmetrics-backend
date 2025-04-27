import { Injectable } from '@nestjs/common'
import TransactionablePrismaClient from 'src/common/util/transaction-prisma-client'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class RegionService {
  constructor(private readonly prismaService: PrismaService) {}

  async regionExists(regionSlug: string, tpc?: TransactionablePrismaClient): Promise<boolean> {
    const exists = await this.prismaService
      .checkTransaction(tpc)
      .region.findUnique({ where: { slug: regionSlug } })

    return !!exists
  }
}
