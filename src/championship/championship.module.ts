import { Module } from '@nestjs/common'
import { AuthModule } from 'src/auth/auth.module'
import { PrismaModule } from 'src/prisma/prisma.module'

@Module({
  imports: [PrismaModule, AuthModule],
})
export class ChampionshipModule {}
