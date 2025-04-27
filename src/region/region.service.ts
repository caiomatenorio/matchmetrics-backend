import { Injectable } from '@nestjs/common'
import RegionSlugAlreadyInUseException from 'src/common/exceptions/region-slug-already-in-use.exception'
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

  async createRegion(name: string, slug: string, flag: string): Promise<void> {
    await this.prismaService.$transaction(async tpc => {
      if (await this.regionExists(slug, tpc)) throw new RegionSlugAlreadyInUseException()

      await this.prismaService.checkTransaction(tpc).region.create({ data: { name, slug, flag } })
    })
  }
}
