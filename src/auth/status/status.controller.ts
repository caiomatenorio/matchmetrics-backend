import { Controller, Get, HttpStatus, Req } from '@nestjs/common'
import SuccessResponseBody from 'src/common/response-bodies/success-response-body'
import { AuthService } from '../auth.service'
import { Request } from 'express'
import { Public } from '../auth.decorator'

@Controller('auth/status')
export class StatusController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get()
  async getAuthStatus(
    @Req() request: Request
  ): Promise<SuccessResponseBody<{ authenticated: boolean }>> {
    const authenticated = await this.authService.getAuthStatus(request)

    return new SuccessResponseBody(HttpStatus.OK, 'Auth status retrieved', { authenticated })
  }
}
