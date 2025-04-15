import { Injectable } from '@nestjs/common'
import { JwtService as NestJwtService } from '@nestjs/jwt'
import JwtPayload from './jwt-payload'

@Injectable()
export class JwtService {
  constructor(private readonly nestJwtService: NestJwtService) {}

  async generateJwt(sessionId: string, userId: string, email: string): Promise<string> {
    const payload: JwtPayload = {
      sub: sessionId,
      userId,
      email,
    }

    return await this.nestJwtService.signAsync(payload)
  }

  async verifyJwt(jwt: string): Promise<JwtPayload | null> {
    try {
      const payload: JwtPayload = await this.nestJwtService.verifyAsync(jwt)
      return payload
    } catch {
      return null
    }
  }
}
