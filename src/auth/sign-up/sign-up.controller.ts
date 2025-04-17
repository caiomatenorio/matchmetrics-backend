import { Body, Controller, HttpCode, HttpStatus, Post, UsePipes } from '@nestjs/common'
import { UsersService } from 'src/users/users.service'
import { ZodValidationPipe } from 'src/zod-validation/zod-validation.pipe'
import signUpSchema, { SignUpInput } from './sign-up.schema'
import SuccessResponseBody, {
  NoDataSuccessResponseBody,
} from 'src/common/response-bodies/success-response-body'
import { Public } from 'src/auth/auth.guard'

@Controller('sign-up')
export class SignUpController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  @UsePipes(new ZodValidationPipe(signUpSchema))
  @HttpCode(HttpStatus.CREATED)
  async createAdmin(@Body() body: SignUpInput): Promise<NoDataSuccessResponseBody> {
    await this.usersService.createUser(body.email, body.password)

    return new SuccessResponseBody(HttpStatus.CREATED, 'User created successfully')
  }
}
