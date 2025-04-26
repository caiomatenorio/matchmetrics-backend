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

  /**
   * Create a new user with the given email, password, and role.
   * @param email - The email of the user
   * @param password - The password of the user
   * @param role - The role of the user
   * @param tpc - TransactionablePrismaClient for transaction management, required because this method needs to be atomic as it checks the disponibility of the email and creates the user with it in a single transaction
   * @throws {EmailAlreadyInUseException} if the email is already in use
   */
  async createUser(
    email: string,
    password: string,
    role: AuthenticatedRole,
    tpc: TransactionablePrismaClient
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

  /**
   * Check if the email is already in use.
   * @param email - The email to check
   * @param tpc - TransactionablePrismaClient for transaction management, optional
   * @returns true if the email is in use, false otherwise
   */
  async isEmailInUse(email: string, tpc?: TransactionablePrismaClient): Promise<boolean> {
    const admin = await this.prismaService.checkTransaction(tpc).user.findUnique({
      where: { email },
      select: { id: true },
    })

    return !!admin
  }

  /**
   * Check if the user exists.
   * @param userId - The ID of the user to check
   * @param tpc - TransactionablePrismaClient for transaction management, optional
   * @returns true if the user exists, false otherwise
   */
  async userExists(userId: string, tpc?: TransactionablePrismaClient): Promise<boolean> {
    const user = await this.prismaService.checkTransaction(tpc).user.findUnique({
      where: { id: userId },
      select: { id: true },
    })

    return !!user
  }

  /**
   * Get the email of the user.
   * @param userId - The ID of the user
   * @param tpc - TransactionablePrismaClient for transaction management, optional
   * @returns the email of the user
   * @throws {UserDoesNotExistException} if the user does not exist
   */
  async getUserEmail(userId: string, tpc?: TransactionablePrismaClient): Promise<string> {
    const { email } =
      (await this.prismaService.checkTransaction(tpc).user.findUnique({
        where: { id: userId },
        select: { email: true },
      })) ?? {}

    if (!email) throw new UserDoesNotExistException()

    return email
  }

  /**
   * Get the ID of the user by email.
   * @param email - The email of the user
   * @param tpc - TransactionablePrismaClient for transaction management, optional
   * @returns the ID of the user
   * @throws {UserDoesNotExistException} if the user does not exist
   */
  async getUserIdByEmail(email: string, tpc?: TransactionablePrismaClient): Promise<string> {
    const { id } =
      (await this.prismaService.checkTransaction(tpc).user.findUnique({
        where: { email },
        select: { id: true },
      })) ?? {}

    if (!id) throw new UserDoesNotExistException()

    return id
  }

  /**
   * Get the role of the user.
   * @param userId - The ID of the user
   * @param tpc - TransactionablePrismaClient for transaction management, optional
   * @returns the role of the user
   * @throws {UserDoesNotExistException} if the user does not exist
   */
  async getUserRole(userId: string, tpc?: TransactionablePrismaClient): Promise<AuthenticatedRole> {
    const { role } =
      (await this.prismaService.checkTransaction(tpc).user.findUnique({
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

  /**
   * Validate the credentials of the user.
   * @param email - The email of the user
   * @param password - The password of the user
   * @param tpc - TransactionablePrismaClient for transaction management, optional
   * @throws {InvalidCredentialsException} if the credentials are invalid
   */
  async validateCredentials(
    email: string,
    password: string,
    tpc?: TransactionablePrismaClient
  ): Promise<void> {
    const admin = await this.prismaService.checkTransaction(tpc).user.findUnique({
      where: { email },
      select: { password: true },
    })

    if (admin && (await bcrypt.compare(password, admin.password))) return

    throw new InvalidCredentialsException()
  }

  /**
   * Update the role of the user.
   * @param userId - The ID of the user
   * @param role - The new role of the user
   * @param tpc - TransactionablePrismaClient for transaction management, required because this method needs to be atomic as it checks the current role of the user and updates it in a single transaction
   * @throws {UserAlreadyHasThisRoleException} if the user already has this role
   */
  async updateUserRole(
    userId: string,
    role: AuthenticatedRole,
    tpc: TransactionablePrismaClient
  ): Promise<void> {
    const currentRole = await this.getUserRole(userId, tpc)

    if (currentRole.equals(role)) throw new UserAlreadyHasThisRoleException(role)

    await this.prismaService.checkTransaction(tpc).user.update({
      where: { id: userId },
      data: { role: role.toPrismaRole() },
    })
  }

  /**
   * Delete the user.
   * @param request - The request object to get the session headers
   * @param response - The response object to delete the session
   * @param password - The password of the user
   * @throws {InvalidCredentialsException} if the credentials are invalid
   */
  async deleteMe(request: Request, response: Response, password: string): Promise<void> {
    await Promise.all([
      this.prismaService.$transaction(async tpc => {
        const { id, email } = await this.authService.whoAmI(request, tpc)
        await this.validateCredentials(email, password)
        await this.prismaService.checkTransaction(tpc).user.delete({ where: { id } })
      }),
      this.authService.logOut(request, response),
    ])
  }
}
