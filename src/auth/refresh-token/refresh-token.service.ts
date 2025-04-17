import { Injectable } from '@nestjs/common'
import { randomBytes } from 'crypto'

@Injectable()
export class RefreshTokenService {
  generateRefreshToken(): string {
    return randomBytes(64).toString('hex')
  }
}
