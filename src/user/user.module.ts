import { forwardRef, Module } from '@nestjs/common'
import { UserService } from './user.service'
import { PrismaModule } from 'src/prisma/prisma.module'
import { UserController } from './user.controller'
import { AuthModule } from 'src/auth/auth.module'

@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule)],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
