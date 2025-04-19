import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { randomBytes } from 'crypto'
import { SessionService } from '../session/session.service'

@Injectable()
export class RefreshTokenService {
  constructor(
    @Inject(forwardRef(() => SessionService)) private readonly sessionService: SessionService
  ) {}

  generateRefreshToken(): string {
    return randomBytes(64).toString('hex')
  }

  async isRefreshTokenValid(refreshToken: string): Promise<boolean> {
    return !!(await this.sessionService.getSessionByRefreshToken(refreshToken))
  }
}
