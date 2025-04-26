import { Injectable, OnApplicationBootstrap } from '@nestjs/common'
import AdminRole from 'src/auth/roles/admin.role'
import RootCredentialsConflictError from 'src/common/errors/root-credentials-conflict.error'
import TransactionablePrismaClient from 'src/common/util/transaction-prisma-client'
import { EnvService } from 'src/env/env.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { UserService } from 'src/user/user.service'

@Injectable()
export class AdminService implements OnApplicationBootstrap {
  constructor(
    private readonly userService: UserService,
    private readonly prismaService: PrismaService,
    private readonly envService: EnvService
  ) {}

  async onApplicationBootstrap() {
    await this.createRoot()
  }

  async adminExists(tpc?: TransactionablePrismaClient): Promise<boolean> {
    const exists = await this.prismaService
      .checkTransaction(tpc)
      .user.findFirst({ where: { role: 'ADMIN' } })

    return !!exists
  }

  async createRoot(): Promise<void> {
    await this.prismaService.$transaction(async tpc => {
      if (await this.adminExists(tpc)) return

      const email = this.envService.rootEmail
      const password = this.envService.rootPassword

      try {
        await this.userService.createUser(email, password, new AdminRole(), tpc)
      } catch {
        throw new RootCredentialsConflictError()
      }
    })
  }

  async promoteToAdmin(userEmail: string): Promise<void> {
    const userId = await this.userService.getUserIdByEmail(userEmail)
    await this.userService.updateUserRole(userId, new AdminRole())
  }
}
