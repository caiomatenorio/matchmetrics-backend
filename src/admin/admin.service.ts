import { Injectable, OnApplicationBootstrap } from '@nestjs/common'
import AdminRole from 'src/auth/roles/admin.role'
import RootCredentialsConflictError from 'src/common/errors/root-credentials-conflict.error'
import RootCredentialsNotDefinedError from 'src/common/errors/root-credentials-not-defined.error'
import { PrismaService } from 'src/prisma/prisma.service'
import { UserService } from 'src/user/user.service'

@Injectable()
export class AdminService implements OnApplicationBootstrap {
  constructor(
    private readonly userService: UserService,
    private readonly prismaService: PrismaService
  ) {}

  async onApplicationBootstrap() {
    if (await this.adminExists()) return
    await this.createRoot()
  }

  async adminExists(): Promise<boolean> {
    const exists = await this.prismaService.user.findFirst({ where: { role: 'ADMIN' } })
    return !!exists
  }

  async createRoot(): Promise<void> {
    const email = process.env.ROOT_EMAIL
    const password = process.env.ROOT_PASSWORD

    if (!(email && password)) {
      throw new RootCredentialsNotDefinedError()
    }

    try {
      await this.userService.createUser(email, password, new AdminRole())
    } catch {
      throw new RootCredentialsConflictError()
    }
  }

  async promoteUser(email: string): Promise<void> {
    const userId = await this.userService.getUserIdByEmail(email)
    await this.userService.updateUserRole(userId, new AdminRole())
  }
}
