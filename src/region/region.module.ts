import { Module } from '@nestjs/common'
import { RegionService } from './region.service'
import { RegionController } from './region.controller'
import { PrismaModule } from 'src/prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  providers: [RegionService],
  controllers: [RegionController],
})
export class RegionModule {}
