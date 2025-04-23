import { Injectable } from '@nestjs/common'
import { SessionService } from './session/session.service'
import { UserService } from 'src/user/user.service'
import { Request, Response } from 'express'
import { JwtService } from './jwt/jwt.service'
import { RefreshTokenService } from './refresh-token/refresh-token.service'
import RoleUnauthorizedException from 'src/common/exceptions/role-unauthorized.exception'
import GuestRole from './roles/guest.role'
import UserRole from './roles/user.role'

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
    private readonly jwtService: JwtService,
    private readonly refreshTokenService: RefreshTokenService
  ) {}

  async signUp(email: string, password: string): Promise<void> {
    await this.userService.createUser(email, password)
  }

  async logIn(email: string, password: string, response: Response): Promise<void> {
    await this.userService.validateCredentials(email, password)
    const userId = await this.userService.getUserIdByEmail(email)
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

  async whoAmI(request: Request): Promise<{ id: string; email: string; role: string }> {
    const { accessToken, refreshToken } = this.sessionService.getTokenHeaders(request)

    if (accessToken && (await this.jwtService.isJwtValid(accessToken))) {
      const { userId: id, email, role } = (await this.jwtService.getJwtPayload(accessToken)) ?? {}
      if (id && email && role) return { id, email, role: role.name }
    }

    if (refreshToken) {
      const { userId } = (await this.sessionService.getSessionByRefreshToken(refreshToken)) ?? {}

      if (userId) {
        return {
          id: userId,
          email: await this.userService.getUserEmail(userId),
          role: (await this.userService.getUserRole(userId)).name,
        }
      }
    }

    throw new RoleUnauthorizedException(new GuestRole(), new UserRole())
  }
}
