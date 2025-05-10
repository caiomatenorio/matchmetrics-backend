import { Module } from '@nestjs/common'
import { AuthModule } from 'src/auth/auth.module'
import { PrismaModule } from 'src/prisma/prisma.module'
import { ChampionshipService } from './championship.service'
import { RegionModule } from 'src/region/region.module'

@Module({
  imports: [PrismaModule, AuthModule, RegionModule],
  providers: [ChampionshipService],
  exports: [ChampionshipService],
})
export class ChampionshipModule {}
