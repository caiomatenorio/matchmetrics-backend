import { forwardRef, Inject, Injectable } from '@nestjs/common'
import UserDoesNotExistException from 'src/common/exceptions/user-does-not-exist.exception'
import { UserService } from 'src/user/user.service'
import { RefreshTokenService } from '../refresh-token/refresh-token.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { JwtService } from '../jwt/jwt.service'
import { Request, Response } from 'express'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Session } from 'generated/prisma'
import RoleUnauthorizedException from 'src/common/exceptions/role-unauthorized.exception'
import AuthenticatedRole from '../roles/authenticated.role'
import Role from '../roles/role'
import GuestRole from '../roles/guest.role'
import Ref from 'src/common/util/ref'
import UserRole from '../roles/user.role'
import TransactionablePrismaClient from 'src/common/util/transaction-prisma-client'

@Injectable()
export class SessionService {
  private readonly sessionExpiresInMillis: number

  constructor(
    @Inject(forwardRef(() => RefreshTokenService))
    private readonly refreshTokenService: RefreshTokenService,

    private readonly userService: UserService,
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService
  ) {
    this.sessionExpiresInMillis = 30 * 24 * 60 * 60 * 1000 // 30 days
  }

  /**
   * Set the token headers in the response.
   * @param response - The response object
   * @param accessToken - The access token to set
   * @param refreshToken - The refresh token to set
   */
  setTokenHeaders(response: Response, accessToken: string, refreshToken: string): void {
    response.setHeader('Authorization', `Bearer ${accessToken}`)
    response.setHeader('X-Refresh-Token', refreshToken)
  }

  /**
   * Get the token headers from the request.
   * @param request - The request object
   * @returns an object containing the access token and refresh token
   */
  getTokenHeaders(request: Request): { accessToken?: string; refreshToken?: string } {
    const accessToken = request.headers['authorization']?.replace('Bearer ', '')
    const refreshToken = request.headers['x-refresh-token'] as string | undefined
    return { accessToken, refreshToken }
  }

  /**
   * Unset the token headers in the response. Used when the user logs out or the session expires.
   * @param response - The response object
   */
  unsetTokenHeaders(response: Response): void {
    // The client should remove the tokens from storage
    response.setHeader('Authorization', '')
    response.setHeader('X-Refresh-Token', '')
  }

  /**
   * Create a new session for the user.
   * @param response - The response object to set the session headers
   * @param userId - The ID of the user to create the session for
   * @param tpc - TransactionablePrismaClient for transaction management, optional
   * @throws {UserDoesNotExistException} if the user does not exist
   */
  async createSession(
    response: Response,
    userId: string,
    tpc?: TransactionablePrismaClient
  ): Promise<void> {
    const userExists = await this.userService.userExists(userId, tpc)
    if (!userExists) throw new UserDoesNotExistException()

    const email = await this.userService.getUserEmail(userId, tpc)
    const userRole = await this.userService.getUserRole(userId, tpc)

    const refreshToken = this.refreshTokenService.generateRefreshToken()
    const expiresAt = new Date(Date.now() + this.sessionExpiresInMillis)

    const { id: sessionId } = await this.prismaService.checkTransaction(tpc).session.create({
      data: { userId, refreshToken, expiresAt },
      select: { id: true },
    })

    const accessToken = await this.jwtService.generateJwt(sessionId, userId, email, userRole)

    this.setTokenHeaders(response, accessToken, refreshToken)
  }

  /**
   * Validate the session by checking the access token and refresh token.
   * @param request - The request object to get the session headers
   * @param response - The response object to set the session headers
   * @param minimumRole - The minimum role required to access the resource
   * @returns true if the session is valid
   * @throws {RoleUnauthorizedException} if the session is not valid
   */
  async validateSession(
    request: Request,
    response: Response,
    minimumRole: AuthenticatedRole
  ): Promise<boolean> {
    const currentUserRoleRef: Ref<Role> = new Ref(new GuestRole())
    const { accessToken, refreshToken } = this.getTokenHeaders(request)

    // There's no need to check if the jwt is valid, because if it's not, the current role will
    // still be Guest, whose hierarchy will always be lower than any authenticated role. However,
    // we do it to improve readability of the code.
    if (accessToken && (await this.jwtService.isJwtValid(accessToken))) {
      currentUserRoleRef.value =
        (await this.jwtService.getRoleFromJwt(accessToken)) ?? currentUserRoleRef.value

      if (currentUserRoleRef.value.hierarchy >= minimumRole.hierarchy) return true
    }

    if (refreshToken) {
      try {
        const { newAccessToken, newRefreshToken } = await this.refreshSession(
          refreshToken,
          minimumRole,
          currentUserRoleRef
        )
        this.setTokenHeaders(response, newAccessToken, newRefreshToken)
        return true
      } catch {
        /* empty */
      }
    }

    this.unsetTokenHeaders(response)
    // If there's an access token and it's valid, proceed
    throw new RoleUnauthorizedException(currentUserRoleRef.value, minimumRole)
  }

  /**
   * Refresh the session by generating a new access token and refresh token.
   * @param refreshToken - The refresh token to validate
   * @param minimumRole - The minimum role required to access the resource
   * @param currentUserRoleRef - A reference to the current user role, used to update it if necessary
   * @returns an object containing the new access token and refresh token
   * @throws {Error} if the refresh token is invalid or the role is unauthorized, generic error to quit try-catch block in the validateSession method
   */
  async refreshSession(
    refreshToken: string,
    minimumRole: AuthenticatedRole,
    currentUserRoleRef: Ref<Role>
  ): Promise<{ newAccessToken: string; newRefreshToken: string }> {
    // We need to use a transaction to ensure that the session is updated atomically
    // and that the user role is not changed in the meantime.
    const [sessionId, userId, email, newRefreshToken] = await this.prismaService.$transaction(
      async tpc => {
        const { id: sessionId, userId } =
          (await this.prismaService.checkTransaction(tpc).session.findUnique({
            where: { refreshToken, expiresAt: { gte: new Date() } },
            select: { id: true, userId: true },
          })) ?? {}

        if (!(sessionId && userId)) throw new Error('Invalid refresh token') // Generic error to quit try-catch block

        currentUserRoleRef.value = await this.userService.getUserRole(userId, tpc)

        if (currentUserRoleRef.value.hierarchy < minimumRole.hierarchy)
          throw new Error('Role unauthorized') // Generic error to quit try-catch block

        const email = await this.userService.getUserEmail(userId, tpc)
        const newRefreshToken = this.refreshTokenService.generateRefreshToken()
        const expiresAt = new Date(Date.now() + this.sessionExpiresInMillis)

        await this.prismaService.checkTransaction(tpc).session.update({
          where: { id: sessionId },
          data: { refreshToken: newRefreshToken, expiresAt },
          select: { id: true },
        })

        return [sessionId, userId, email, newRefreshToken]
      }
    )

    const newAccessToken = await this.jwtService.generateJwt(
      sessionId,
      userId,
      email,
      currentUserRoleRef.value as AuthenticatedRole // Since we just fetched the role from the database, we can safely cast it
    )

    return { newAccessToken, newRefreshToken }
  }

  /**
   * Delete the session by removing it from the database and unsetting the token headers.
   * @param request - The request object to get the session headers
   * @param response - The response object to delete the session
   * @throws {RoleUnauthorizedException} if the session is not valid
   */
  async deleteSession(request: Request, response: Response): Promise<void> {
    const { refreshToken } = this.getTokenHeaders(request)

    if (refreshToken) {
      try {
        // We don't use a transaction as it does not depend on another operation
        await this.prismaService.session.delete({ where: { refreshToken } })
        this.unsetTokenHeaders(response)
        return
      } catch {
        /* empty */
      }
    }

    this.unsetTokenHeaders(response)
    throw new RoleUnauthorizedException(new GuestRole(), new UserRole())
  }

  /**
   * Cleanup expired sessions by deleting them from the database.
   * This method is scheduled to run every hour.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredSessions(): Promise<void> {
    await this.prismaService.session.deleteMany({ where: { expiresAt: { lt: new Date() } } }) // Delete all sessions that have expired
  }

  /**
   * Get the session by refresh token.
   * @param refreshToken - The refresh token to search for
   * @param tpc - TransactionablePrismaClient for transaction management, optional
   * @returns the session if found, null otherwise
   */
  async getSessionByRefreshToken(
    refreshToken: string,
    tpc?: TransactionablePrismaClient
  ): Promise<Session | null> {
    return this.prismaService.checkTransaction(tpc).session.findUnique({
      where: { refreshToken, expiresAt: { gte: new Date() } },
    })
  }
}
