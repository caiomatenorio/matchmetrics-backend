import { Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common'
import { AdminOnly } from 'src/auth/auth.decorator'
import SuccessResponseBody, {
  NoDataSuccessResponseBody,
} from 'src/common/response-bodies/success-response-body'
import { ZodValidationPipe } from 'src/zod-validation/zod-validation.pipe'
import { PromoteUserParams, promoteUserParamsSchema } from './admin.schema'
import { AdminService } from './admin.service'

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @AdminOnly()
  @Post('promote-user/:email')
  @HttpCode(HttpStatus.OK)
  async promoteUser(
    @Param(new ZodValidationPipe(promoteUserParamsSchema)) params: PromoteUserParams
  ): Promise<NoDataSuccessResponseBody> {
    await this.adminService.promoteUser(params.email)

    return new SuccessResponseBody(HttpStatus.OK, 'User promoted successfully')
  }
}
