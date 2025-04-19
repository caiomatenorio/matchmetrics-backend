import { Controller, HttpStatus, Post, Req, Res } from '@nestjs/common'
import { Request, Response } from 'express'
import { AuthService } from '../auth.service'
import SuccessResponseBody, {
  NoDataSuccessResponseBody,
} from 'src/common/response-bodies/success-response-body'

@Controller('log-out')
export class LogOutController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async logOut(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ): Promise<NoDataSuccessResponseBody> {
    await this.authService.logOut(request, response)

    return new SuccessResponseBody(HttpStatus.OK, 'Logged out successfully')
  }
}
