import { Injectable } from '@nestjs/common'
import UserDoesNotExistException from 'src/common/exceptions/user-does-not-exist.exception'
import { UsersService } from 'src/users/users.service'
import { RefreshTokenService } from '../refresh-token/refresh-token.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { JwtService } from '../jwt/jwt.service'
import UserUnauthorizedException from 'src/common/exceptions/user-unauthorized.exception'

@Injectable()
export class SessionService {
  private readonly sessionExpiresInMillis: number

  constructor(
    private readonly usersService: UsersService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService
  ) {
    this.sessionExpiresInMillis = 30 * 24 * 60 * 60 * 1000 // 30 days
  }

  setTokenHeaders(response: Response, accessToken: string, refreshToken: string): void {
    response.headers.set('Authorization', `Bearer ${accessToken}`)
    response.headers.set('X-Refresh-Token', refreshToken)
  }

  getTokenHeaders(request: Request): { accessToken: string; refreshToken: string } {
    const accessToken = request.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
    const refreshToken = request.headers.get('X-Refresh-Token') ?? ''
    return { accessToken, refreshToken }
  }

  unsetTokenHeaders(response: Response): void {
    // The client should remove the tokens from storage
    response.headers.set('Authorization', '')
    response.headers.set('X-Refresh-Token', '')
  }

  async createSession(response: Response, userId: string): Promise<void> {
    const userExists = await this.usersService.userExists(userId)
    if (!userExists) throw new UserDoesNotExistException()

    const email = await this.usersService.getEmailById(userId)

    const refreshToken = this.refreshTokenService.generateRefreshToken()
    const expiresAt = new Date(Date.now() + this.sessionExpiresInMillis)

    const { id: sessionId } = await this.prismaService.session.create({
      data: { userId, refreshToken, expiresAt },
      select: { id: true },
    })

    const accessToken = await this.jwtService.generateJwt(sessionId, userId, email)

    this.setTokenHeaders(response, accessToken, refreshToken) // Send the tokens in the response headers
  }

  async validateSession(request: Request, response: Response): Promise<void> {
    const { accessToken, refreshToken } = this.getTokenHeaders(request)

    // If there's an access token and it's valid, proceed
    if (accessToken && (await this.jwtService.verifyJwt(accessToken))) return

    if (refreshToken) {
      try {
        const { newAccessToken, newRefreshToken } = await this.refreshSession(refreshToken)
        this.setTokenHeaders(response, newAccessToken, newRefreshToken) // Send the new tokens in the response headers
      } catch {
        /* empty */
      }
    }

    this.unsetTokenHeaders(response)
    throw new UserUnauthorizedException() // If there's no valid access token and no valid refresh token, return 401
  }

  async refreshSession(
    refreshToken: string
  ): Promise<{ newAccessToken: string; newRefreshToken: string }> {
    const { id: sessionId } =
      (await this.prismaService.session.findUnique({
        where: { refreshToken },
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
    const email = await this.usersService.getEmailById(userId)

    const newAccessToken = await this.jwtService.generateJwt(sessionId, userId, email)

    return { newAccessToken, newRefreshToken }
  }
}
