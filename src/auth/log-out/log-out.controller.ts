import { Controller, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common'
import { Request, Response } from 'express'
import { AuthService } from '../auth.service'
import SuccessResponseBody, {
  NoDataSuccessResponseBody,
} from 'src/common/response-bodies/success-response-body'
import { Authenticated } from '../auth.decorator'

@Controller('log-out')
export class LogOutController {
  constructor(private readonly authService: AuthService) {}

  @Authenticated()
  @Post()
  @HttpCode(HttpStatus.OK)
  async logOut(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ): Promise<NoDataSuccessResponseBody> {
    await this.authService.logOut(request, response)

    return new SuccessResponseBody(HttpStatus.OK, 'Logged out successfully')
  }
}
