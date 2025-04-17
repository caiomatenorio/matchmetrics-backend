import { Body, Controller, HttpCode, HttpStatus, Post, UsePipes } from '@nestjs/common'
import { UsersService } from './users.service'
import { ZodValidationPipe } from 'src/zod-validation/zod-validation.pipe'
import signUpSchema, { SignUpInput } from './sign-up.schema'
import SuccessResponseBody, {
  NoDataSuccessResponseBody,
} from 'src/common/response-bodies/success-response-body'
import { Public } from 'src/auth/auth.guard'

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post('sign-up')
  @UsePipes(new ZodValidationPipe(signUpSchema))
  @HttpCode(HttpStatus.CREATED)
  async createAdmin(@Body() body: SignUpInput): Promise<NoDataSuccessResponseBody> {
    // Disable the following line because we are sure that the body is valid
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    await this.usersService.createUser(body.email, body.password)

    return new SuccessResponseBody(HttpStatus.CREATED, 'User created successfully')
  }
}
