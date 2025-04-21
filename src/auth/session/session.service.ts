import { forwardRef, Inject, Injectable } from '@nestjs/common'
import UserDoesNotExistException from 'src/common/exceptions/user-does-not-exist.exception'
import { UsersService } from 'src/users/users.service'
import { RefreshTokenService } from '../refresh-token/refresh-token.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { JwtService } from '../jwt/jwt.service'
import { Request, Response } from 'express'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Session } from 'generated/prisma'
import RoleUnauthorizedException from 'src/common/exceptions/role-unauthorized.exception'
import { AuthenticatedRole } from '../roles'
import UnauthenticatedException from 'src/common/exceptions/unauthenticated.exception'

@Injectable()
export class SessionService {
  private readonly sessionExpiresInMillis: number

  constructor(
    @Inject(forwardRef(() => RefreshTokenService))
    private readonly refreshTokenService: RefreshTokenService,

    private readonly usersService: UsersService,
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
    const userExists = await this.usersService.userExists(userId)
    if (!userExists) throw new UserDoesNotExistException()

    const email = await this.usersService.getUserEmailById(userId)
    const userRole = await this.usersService.getUserRoleById(userId)

    const refreshToken = this.refreshTokenService.generateRefreshToken()
    const expiresAt = new Date(Date.now() + this.sessionExpiresInMillis)

    const { id: sessionId } = await this.prismaService.session.create({
      data: { userId, refreshToken, expiresAt },
      select: { id: true },
    })

    const accessToken = await this.jwtService.generateJwt(sessionId, userId, email, userRole)

    this.setTokenHeaders(response, accessToken, refreshToken) // Send the tokens in the response headers
  }

  async validateSession(
    request: Request,
    response: Response,
    minimumRole: AuthenticatedRole
  ): Promise<boolean> {
    const { accessToken, refreshToken } = this.getTokenHeaders(request)

    // If there's an access token and it's valid, proceed
    if (accessToken && (await this.jwtService.isJwtValid(accessToken))) {
      const role = await this.jwtService.getRoleFromJwtOrThrow(accessToken)
      if (role < minimumRole) throw new RoleUnauthorizedException(role, minimumRole)
      return true
    }

    if (refreshToken) {
      try {
        const { newAccessToken, newRefreshToken } = await this.refreshSession(
          refreshToken,
          minimumRole
        )
        this.setTokenHeaders(response, newAccessToken, newRefreshToken) // Send the new tokens in the response headers
        return true
      } catch {
        /* empty */
      }
    }

    this.unsetTokenHeaders(response)
    throw new UnauthenticatedException() // If there's no valid access token and no valid refresh token, return 401
  }

  async refreshSession(
    refreshToken: string,
    minimumRole: AuthenticatedRole
  ): Promise<{ newAccessToken: string; newRefreshToken: string }> {
    const { id: sessionId } =
      (await this.prismaService.session.findUnique({
        where: { refreshToken, expiresAt: { gte: new Date() } },
        select: { id: true },
      })) ?? {} // If the session doesn't exist, id will be undefined
    if (!sessionId) throw new Error('Session not found') // Generic error to quit validateSession try/catch block

    const newRefreshToken = this.refreshTokenService.generateRefreshToken()
    const expiresAt = new Date(Date.now() + this.sessionExpiresInMillis)

    const { userId } = await this.prismaService.session.update({
      where: { id: sessionId },
      data: { refreshToken: newRefreshToken, expiresAt },
      select: { userId: true },
    })

    const email = await this.usersService.getUserEmailById(userId)
    const userRole = await this.usersService.getUserRoleById(userId)
    if (userRole < minimumRole) throw new RoleUnauthorizedException(userRole, minimumRole)
    const newAccessToken = await this.jwtService.generateJwt(sessionId, userId, email, userRole)

    return { newAccessToken, newRefreshToken }
  }

  async deleteSession(request: Request, response: Response): Promise<void> {
    const { refreshToken } = this.getTokenHeaders(request)
    if (!refreshToken) throw new UnauthenticatedException()

    try {
      await this.prismaService.session.delete({ where: { refreshToken } })
    } catch {
      throw new UnauthenticatedException() // If the refresh token is not valid, return 401
    }

    this.unsetTokenHeaders(response) // Remove the tokens from the response headers
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
