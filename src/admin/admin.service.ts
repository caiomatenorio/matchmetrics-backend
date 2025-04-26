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

  /**
   * Check if an admin user exists
   * @param tpc - TransactionablePrismaClient for transaction management, optional
   * @returns true if an admin user exists, false otherwise
   */
  async adminExists(tpc?: TransactionablePrismaClient): Promise<boolean> {
    const exists = await this.prismaService
      .checkTransaction(tpc)
      .user.findFirst({ where: { role: 'ADMIN' } })

    return !!exists
  }

  /**
   * Create a root user if it doesn't exist
   * @throws {RootCredentialsConflictError} if the root credentials are already in use
   */
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

  /**
   * Promote a user to admin
   * @param userEmail - The email of the user to promote
   */
  async promoteToAdmin(userEmail: string): Promise<void> {
    await this.prismaService.$transaction(async tpc => {
      const userId = await this.userService.getUserIdByEmail(userEmail, tpc)
      await this.userService.updateUserRole(userId, new AdminRole(), tpc)
    })
  }
}
