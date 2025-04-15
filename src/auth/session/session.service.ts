import { Injectable } from '@nestjs/common'
import UserDoesNotExistException from 'src/common/exceptions/user-does-not-exist.exception'
import { UsersService } from 'src/users/users.service'
import { RefreshTokenService } from '../refresh-token/refresh-token.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { JwtService } from '../jwt/jwt.service'

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

  async createSession(userId: string): Promise<{ accessToken: string; refreshToken: string }> {
    const userExists = await this.usersService.userExists(userId)
    if (!userExists) throw new UserDoesNotExistException()

    const refreshToken = this.refreshTokenService.generateRefreshToken()
    const expiresAt = new Date(Date.now() + this.sessionExpiresInMillis)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const { id: sessionId } = await this.prismaService.session.create({
      data: { userId, refreshToken, expiresAt },
      select: { id: true },
    })

    const email = await this.usersService.getEmailById(userId)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const accessToken = await this.jwtService.generateJwt(sessionId, userId, email)

    return { accessToken, refreshToken }
  }
}
