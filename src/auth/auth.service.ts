import { Injectable } from '@nestjs/common'
import { SessionService } from './session/session.service'
import { UsersService } from 'src/users/users.service'
import { Request, Response } from 'express'
import { JwtService } from './jwt/jwt.service'
import { RefreshTokenService } from './refresh-token/refresh-token.service'
import UserUnauthorizedException from 'src/common/exceptions/user-unauthorized.exception'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly sessionService: SessionService,
    private readonly jwtService: JwtService,
    private readonly refreshTokenService: RefreshTokenService
  ) {}

  async signUp(email: string, password: string): Promise<void> {
    await this.usersService.createUser(email, password)
  }

  async logIn(email: string, password: string, response: Response): Promise<void> {
    await this.usersService.validateCredentials(email, password)
    const userId = await this.usersService.getUserIdByEmail(email)
    await this.sessionService.createSession(response, userId)
  }

  async logOut(request: Request, response: Response): Promise<void> {
    await this.sessionService.deleteSession(request, response)
  }

  async getAuthStatus(request: Request): Promise<boolean> {
    const { accessToken, refreshToken } = this.sessionService.getTokenHeaders(request)
    if (accessToken && (await this.jwtService.isJwtValid(accessToken))) return true
    if (refreshToken && (await this.refreshTokenService.isRefreshTokenValid(refreshToken)))
      return true
    return false
  }

  async whoAmI(
    request: Request,
    include: { id: boolean; email: boolean } = { id: false, email: true }
  ): Promise<{ id?: string; email?: string }> {
    const { accessToken, refreshToken } = this.sessionService.getTokenHeaders(request)

    if (accessToken) {
      const jwtPayload = await this.jwtService.getJwtPayload(accessToken)

      if (jwtPayload)
        return {
          id: include.id ? jwtPayload.userId : undefined,
          email: include.email ? jwtPayload.email : undefined,
        }
    }

    if (refreshToken) {
      const { userId } = (await this.sessionService.getSessionByRefreshToken(refreshToken)) ?? {}

      if (userId)
        return {
          id: include.id ? userId : undefined,
          email: include.email ? await this.usersService.getUserEmailById(userId) : undefined,
        }
    }

    throw new UserUnauthorizedException()
  }
}
