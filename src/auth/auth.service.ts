import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { SessionService } from './session/session.service'
import { UserService } from 'src/user/user.service'
import { Request, Response } from 'express'
import { JwtService } from './jwt/jwt.service'
import { RefreshTokenService } from './refresh-token/refresh-token.service'
import RoleUnauthorizedException from 'src/common/exceptions/role-unauthorized.exception'
import GuestRole from './roles/guest.role'
import UserRole from './roles/user.role'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
    private readonly sessionService: SessionService,
    private readonly jwtService: JwtService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly prismaService: PrismaService
  ) {}

  /**
   * Sign up a new user
   * @param email - The email of the user
   * @param password - The password of the user
   */
  async signUp(email: string, password: string): Promise<void> {
    await this.prismaService.$transaction(async tpc => {
      await this.userService.createUser(email, password, new UserRole(), tpc)
    })
  }

  /**
   * Log in a user
   * @param email - The email of the user
   * @param password - The password of the user
   * @param response - The response object to set the session headers
   */
  async logIn(email: string, password: string, response: Response): Promise<void> {
    await this.prismaService.$transaction(async tpc => {
      await this.userService.validateCredentials(email, password, tpc)
      const userId = await this.userService.getUserIdByEmail(email, tpc)
      await this.sessionService.createSession(response, userId, tpc)
    })
  }

  /**
   * Log out a user
   * @param request - The request object to get the session headers
   * @param response - The response object to delete the session
   */
  async logOut(request: Request, response: Response): Promise<void> {
    await this.sessionService.deleteSession(request, response)
  }

  /**
   * Get the authentication status of the user
   * @param request - The request object to get the session headers
   * @returns true if the user is authenticated, false otherwise
   */
  async getAuthStatus(request: Request): Promise<boolean> {
    const { accessToken, refreshToken } = this.sessionService.getTokenHeaders(request)
    if (accessToken && (await this.jwtService.isJwtValid(accessToken))) return true
    if (refreshToken && (await this.refreshTokenService.isRefreshTokenValid(refreshToken)))
      return true
    return false
  }

  /**
   * Retrieve the user information from the access token or refresh token
   * @param request - The request object to get the session headers
   * @returns id, email, and role of the user
   * @throws {RoleUnauthorizedException} if the user is not authenticated
   */
  async whoAmI(request: Request): Promise<{ id: string; email: string; role: string }> {
    const { accessToken, refreshToken } = this.sessionService.getTokenHeaders(request)

    if (accessToken && (await this.jwtService.isJwtValid(accessToken))) {
      const { userId: id, email, role } = (await this.jwtService.getJwtPayload(accessToken)) ?? {}
      if (id && email && role) return { id, email, role: role.name }
    }

    if (refreshToken) {
      const result = await this.prismaService.$transaction(async tpc => {
        const { userId } =
          (await this.sessionService.getSessionByRefreshToken(refreshToken, tpc)) ?? {}

        if (userId) {
          return {
            id: userId,
            email: await this.userService.getUserEmail(userId, tpc),
            role: (await this.userService.getUserRole(userId, tpc)).name,
          }
        }
      })

      if (result) return result
    }

    throw new RoleUnauthorizedException(new GuestRole(), new UserRole())
  }
}
