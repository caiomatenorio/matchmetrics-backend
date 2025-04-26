import { forwardRef, Inject, Injectable } from '@nestjs/common'
import EmailAlreadyInUseException from 'src/common/exceptions/email-already-in-use.exception'
import { PrismaService } from 'src/prisma/prisma.service'
import UserDoesNotExistException from 'src/common/exceptions/user-does-not-exist.exception'
import * as bcrypt from 'bcrypt'
import InvalidCredentialsException from 'src/common/exceptions/invalid-credentials.exception'
import AuthenticatedRole from 'src/auth/roles/authenticated.role'
import UserRole from 'src/auth/roles/user.role'
import AdminRole from 'src/auth/roles/admin.role'
import UserAlreadyHasThisRoleException from 'src/common/exceptions/user-already-has-this-role.exception'
import { Request, Response } from 'express'
import { AuthService } from 'src/auth/auth.service'
import TransactionablePrismaClient from 'src/common/util/transaction-prisma-client'

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(forwardRef(() => AuthService)) private readonly authService: AuthService
  ) {}

  async createUser(
    email: string,
    password: string,
    role: AuthenticatedRole = new UserRole(),
    tpc?: TransactionablePrismaClient
  ): Promise<void> {
    const isEmailInUse = await this.isEmailInUse(email, tpc)
    if (isEmailInUse) throw new EmailAlreadyInUseException()

    const hashedPassword = await bcrypt.hash(password, 10)

    await this.prismaService.checkTransaction(tpc).user.create({
      data: {
        email,
        password: hashedPassword,
        role: role.toPrismaRole(),
      },
    })
  }

  async isEmailInUse(email: string, tpc?: TransactionablePrismaClient): Promise<boolean> {
    const admin = await this.prismaService.checkTransaction(tpc).user.findUnique({
      where: { email },
      select: { id: true },
    })

    return !!admin
  }

  async userExists(userId: string): Promise<boolean> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })

    return !!user
  }

  async getUserEmail(userId: string): Promise<string> {
    const { email } =
      (await this.prismaService.user.findUnique({
        where: { id: userId },
        select: { email: true },
      })) ?? {}

    if (!email) throw new UserDoesNotExistException()

    return email
  }

  async getUserIdByEmail(email: string): Promise<string> {
    const { id } =
      (await this.prismaService.user.findUnique({
        where: { email },
        select: { id: true },
      })) ?? {}

    if (!id) throw new UserDoesNotExistException()

    return id
  }

  async getUserRole(userId: string): Promise<AuthenticatedRole> {
    const { role } =
      (await this.prismaService.user.findUnique({
        where: { id: userId },
        select: { role: true },
      })) ?? {}

    if (!role) throw new UserDoesNotExistException()

    switch (role) {
      case 'USER':
        return new UserRole()
      case 'ADMIN':
        return new AdminRole()
    }
  }

  async validateCredentials(email: string, password: string): Promise<void> {
    const admin = await this.prismaService.user.findUnique({
      where: { email },
      select: { password: true },
    })

    if (admin && (await bcrypt.compare(password, admin.password))) return

    throw new InvalidCredentialsException()
  }

  async updateUserRole(userId: string, role: AuthenticatedRole): Promise<void> {
    const currentRole = await this.getUserRole(userId)

    if (currentRole.equals(role)) throw new UserAlreadyHasThisRoleException(role)

    await this.prismaService.user.update({
      where: { id: userId },
      data: { role: role.toPrismaRole() },
    })
  }

  async deleteMe(request: Request, response: Response, password: string): Promise<void> {
    const { id, email } = await this.authService.whoAmI(request)
    await this.validateCredentials(email, password)
    await this.authService.logOut(request, response)
    await this.prismaService.user.delete({ where: { id } })
  }
}
