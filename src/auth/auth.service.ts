import { Injectable } from '@nestjs/common'
import { SessionService } from './session/session.service'
import { UsersService } from 'src/users/users.service'
import { Response } from 'express'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly sessionService: SessionService
  ) {}

  async logIn(email: string, password: string, response: Response): Promise<void> {
    await this.usersService.validateCredentials(email, password)
    const userId = await this.usersService.getIdByEmail(email)
    await this.sessionService.createSession(response, userId)
  }
}
