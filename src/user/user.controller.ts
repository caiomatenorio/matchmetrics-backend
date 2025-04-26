import { Body, Controller, Delete, HttpCode, HttpStatus, Req, Res, UsePipes } from '@nestjs/common'
import { Authenticated } from 'src/auth/auth.decorator'
import SuccessResponseBody, {
  NoDataSuccessResponseBody,
} from 'src/common/response-bodies/success-response-body'
import { deleteMeSchema, DeleteMeBody } from './user.schema'
import { ZodValidationPipe } from 'src/zod-validation/zod-validation.pipe'
import { UserService } from './user.service'
import { Request, Response } from 'express'

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Authenticated()
  @Delete('me')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(deleteMeSchema))
  async deleteMe(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Body() body: DeleteMeBody
  ): Promise<NoDataSuccessResponseBody> {
    await this.userService.deleteMe(request, response, body.password)

    return new SuccessResponseBody(HttpStatus.OK, 'User deleted successfully')
  }
}
