import { Module } from '@nestjs/common'
import { AdminService } from './admin.service'
import { AdminController } from './admin.controller'
import { UserModule } from 'src/user/user.module'
import { PrismaModule } from 'src/prisma/prisma.module'

@Module({
  imports: [UserModule, PrismaModule],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
