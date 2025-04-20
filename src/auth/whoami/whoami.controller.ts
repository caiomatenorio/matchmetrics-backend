import { Controller, Get, HttpStatus, Req } from '@nestjs/common'
import { AuthService } from '../auth.service'
import { Request } from 'express'
import SuccessResponseBody from 'src/common/response-bodies/success-response-body'

@Controller('whoami')
export class WhoamiController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  async whoAmI(
    @Req() request: Request
  ): Promise<SuccessResponseBody<{ id?: string; email?: string }>> {
    const data = await this.authService.whoAmI(request)

    return new SuccessResponseBody(HttpStatus.OK, 'User information retrieved successfully', data)
  }
}
