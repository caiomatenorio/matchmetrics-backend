import { Module } from '@nestjs/common'
import { AuthModule } from 'src/auth/auth.module'
import { CountryModule } from 'src/country/country.module'
import { PrismaModule } from 'src/prisma/prisma.module'
import { ChampionshipService } from './championship.service'

@Module({
  imports: [PrismaModule, AuthModule, CountryModule],
  providers: [ChampionshipService],
})
export class ChampionshipModule {}
