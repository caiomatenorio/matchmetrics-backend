import { Module } from '@nestjs/common'
import { AuthModule } from 'src/auth/auth.module'
import { PrismaModule } from 'src/prisma/prisma.module'
import { ChampionshipService } from './championship.service'
import { RegionService } from 'src/region/region.service'

@Module({
  imports: [PrismaModule, AuthModule, RegionService],
  providers: [ChampionshipService],
})
export class ChampionshipModule {}
