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

  setTokenHeaders(response: Response, accessToken: string, refreshToken: string): void {
    response.setHeader('Authorization', `Bearer ${accessToken}`)
    response.setHeader('X-Refresh-Token', refreshToken)
  }

  getTokenHeaders(request: Request): { accessToken?: string; refreshToken?: string } {
    const accessToken = request.headers['authorization']?.replace('Bearer ', '')
    const refreshToken = request.headers['x-refresh-token'] as string | undefined
    return { accessToken, refreshToken }
  }

  unsetTokenHeaders(response: Response): void {
    // The client should remove the tokens from storage
    response.setHeader('Authorization', '')
    response.setHeader('X-Refresh-Token', '')
  }

  async createSession(response: Response, userId: string): Promise<void> {
    const userExists = await this.userService.userExists(userId)
    if (!userExists) throw new UserDoesNotExistException()

    const email = await this.userService.getUserEmail(userId)
    const userRole = await this.userService.getUserRole(userId)

    const refreshToken = this.refreshTokenService.generateRefreshToken()
    const expiresAt = new Date(Date.now() + this.sessionExpiresInMillis)

    const { id: sessionId } = await this.prismaService.session.create({
      data: { userId, refreshToken, expiresAt },
      select: { id: true },
    })

    const accessToken = await this.jwtService.generateJwt(sessionId, userId, email, userRole)

    this.setTokenHeaders(response, accessToken, refreshToken)
  }

  async validateSession(
    request: Request,
    response: Response,
    minimumRole: AuthenticatedRole
  ): Promise<boolean> {
    const currentUserRoleRef: Ref<Role> = new Ref(new GuestRole())
    const { accessToken, refreshToken } = this.getTokenHeaders(request)

    /*
     * There's no need to check if the jwt is valid, because if it's not, the current role will
     * still be Guest, whose hierarchy will always be lower than any authenticated role. However,
     * we do it to improve readability of the code.
     */
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

  async refreshSession(
    refreshToken: string,
    minimumRole: AuthenticatedRole,
    currentUserRoleRef: Ref<Role>
  ): Promise<{ newAccessToken: string; newRefreshToken: string }> {
    const { id: sessionId, userId } =
      (await this.prismaService.session.findUnique({
        where: { refreshToken, expiresAt: { gte: new Date() } },
        select: { id: true, userId: true },
      })) ?? {}
    if (!(sessionId && userId)) throw new Error('Invalid refresh token') // Generic error to quit try-catch block

    currentUserRoleRef.value = await this.userService.getUserRole(userId)
    if (currentUserRoleRef.value.hierarchy < minimumRole.hierarchy)
      throw new Error('Role unauthorized') // Generic error to quit try-catch block

    const email = await this.userService.getUserEmail(userId)
    const newRefreshToken = this.refreshTokenService.generateRefreshToken()
    const expiresAt = new Date(Date.now() + this.sessionExpiresInMillis)

    await this.prismaService.session.update({
      where: { id: sessionId },
      data: { refreshToken: newRefreshToken, expiresAt },
      select: { id: true },
    })

    const newAccessToken = await this.jwtService.generateJwt(
      sessionId,
      userId,
      email,
      currentUserRoleRef.value as AuthenticatedRole // Since we just fetched the role from the database, we can safely cast it
    )

    return { newAccessToken, newRefreshToken }
  }

  async deleteSession(request: Request, response: Response): Promise<void> {
    const { refreshToken } = this.getTokenHeaders(request)

    if (refreshToken) {
      try {
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

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredSessions(): Promise<void> {
    await this.prismaService.session.deleteMany({ where: { expiresAt: { lt: new Date() } } }) // Delete all sessions that have expired
  }

  async getSessionByRefreshToken(refreshToken: string): Promise<Session | null> {
    return this.prismaService.session.findUnique({
      where: { refreshToken, expiresAt: { gte: new Date() } },
    })
  }
}
