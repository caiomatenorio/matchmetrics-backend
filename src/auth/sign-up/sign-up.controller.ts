import { Body, Controller, HttpStatus, Post, UsePipes } from '@nestjs/common'
import { ZodValidationPipe } from 'src/zod-validation/zod-validation.pipe'
import signUpSchema, { SignUpInput } from './sign-up.schema'
import SuccessResponseBody, {
  NoDataSuccessResponseBody,
} from 'src/common/response-bodies/success-response-body'
import { Public } from 'src/auth/auth.guard'
import { AuthService } from '../auth.service'

@Controller('sign-up')
export class SignUpController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post()
  @UsePipes(new ZodValidationPipe(signUpSchema))
  async createAdmin(@Body() body: SignUpInput): Promise<NoDataSuccessResponseBody> {
    await this.authService.signUp(body.email, body.password)

    return new SuccessResponseBody(HttpStatus.CREATED, 'User created successfully')
  }
}
