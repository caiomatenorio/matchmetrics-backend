import { Body, Controller, HttpCode, HttpStatus, Post, Res, UsePipes } from '@nestjs/common'
import { AuthService } from '../auth.service'
import { Public } from '../auth.guard'
import { ZodValidationPipe } from 'src/zod-validation/zod-validation.pipe'
import { LogInInput, logInSchema } from './log-in.schema'
import { Response } from 'express'
import SuccessResponseBody, {
  NoDataSuccessResponseBody,
} from 'src/common/response-bodies/success-response-body'

@Controller('log-in')
export class LogInController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post()
  @UsePipes(new ZodValidationPipe(logInSchema))
  @HttpCode(HttpStatus.OK)
  async logIn(
    @Body() body: LogInInput,
    @Res({ passthrough: true }) response: Response
  ): Promise<NoDataSuccessResponseBody> {
    await this.authService.logIn(body.email, body.password, response)

    return new SuccessResponseBody(HttpStatus.OK, 'Login successful')
  }
}
