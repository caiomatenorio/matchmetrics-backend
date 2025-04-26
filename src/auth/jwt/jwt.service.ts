import { Injectable } from '@nestjs/common'
import { JwtService as NestJwtService } from '@nestjs/jwt'
import JwtPayload from './jwt-payload'
import AuthenticatedRole from '../roles/authenticated.role'

@Injectable()
export class JwtService {
  constructor(private readonly nestJwtService: NestJwtService) {}

  async generateJwt(
    sessionId: string,
    userId: string,
    email: string,
    role: AuthenticatedRole
  ): Promise<string> {
    const payload: JwtPayload = {
      sub: sessionId,
      userId,
      email,
      role,
    }

    return await this.nestJwtService.signAsync(payload)
  }

  async isJwtValid(jwt: string): Promise<boolean> {
    try {
      await this.nestJwtService.verifyAsync(jwt)
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }

  async getJwtPayload(jwt: string): Promise<JwtPayload | null> {
    try {
      const payload: JwtPayload = await this.nestJwtService.verifyAsync(jwt)
      return payload
    } catch {
      return null
    }
  }

  async getRoleFromJwt(jwt: string): Promise<AuthenticatedRole | null> {
    const { role } = (await this.getJwtPayload(jwt)) ?? {}
    return role ?? null
  }
}
