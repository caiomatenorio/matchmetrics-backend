import { Module } from '@nestjs/common'
import { CountryService } from './country.service'
import { PrismaModule } from 'src/prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  providers: [CountryService],
  exports: [CountryService],
})
export class CountryModule {}
