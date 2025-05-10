import { Injectable } from '@nestjs/common'
import RegionNotFoundException from 'src/common/exceptions/region-not-found.exception'
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

  async updateRegion(slug: string, name?: string, newSlug?: string, flag?: string): Promise<void> {
    await this.prismaService.$transaction(async tpc => {
      const region = await this.prismaService
        .checkTransaction(tpc)
        .region.findUnique({ where: { slug } })

      if (!region) throw new RegionNotFoundException()

      if (newSlug && newSlug !== slug && (await this.regionExists(newSlug, tpc)))
        throw new RegionSlugAlreadyInUseException()

      await this.prismaService.checkTransaction(tpc).region.update({
        where: { slug },

        data: {
          name,
          slug: newSlug,
          flag,
        },
      })
    })
  }

  async deleteRegion(slug: string): Promise<void> {
    await this.prismaService.$transaction(async tpc => {
      const region = await this.prismaService
        .checkTransaction(tpc)
        .region.findUnique({ where: { slug } })

      if (!region) throw new RegionNotFoundException()

      await this.prismaService.checkTransaction(tpc).region.delete({ where: { slug } })
    })
  }
}
