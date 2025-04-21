import { Body, Controller, HttpCode, HttpStatus, Post, UsePipes } from '@nestjs/common'
import { ZodValidationPipe } from 'src/zod-validation/zod-validation.pipe'
import signUpSchema, { SignUpInput } from './sign-up.schema'
import SuccessResponseBody, {
  NoDataSuccessResponseBody,
} from 'src/common/response-bodies/success-response-body'
import { AuthService } from '../auth.service'
import { MinimumRole } from '../auth.decorator'
import Role from '../roles'

@Controller('sign-up')
export class SignUpController {
  constructor(private readonly authService: AuthService) {}

  @MinimumRole(Role.GUEST)
  @Post()
  @UsePipes(new ZodValidationPipe(signUpSchema))
  @HttpCode(HttpStatus.CREATED)
  async createAdmin(@Body() body: SignUpInput): Promise<NoDataSuccessResponseBody> {
    await this.authService.signUp(body.email, body.password)

    return new SuccessResponseBody(HttpStatus.CREATED, 'User created successfully')
  }
}
