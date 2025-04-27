import { Body, Controller, HttpCode, HttpStatus, Post, UsePipes } from '@nestjs/common'
import { AdminOnly } from 'src/auth/auth.decorator'
import { ZodValidationPipe } from 'src/zod-validation/zod-validation.pipe'
import { CreateRegionBody, createRegionSchema } from './region.schema'
import SuccessResponseBody, {
  NoDataSuccessResponseBody,
} from 'src/common/response-bodies/success-response-body'
import { RegionService } from './region.service'

@Controller('region')
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  @AdminOnly()
  @Post()
  @UsePipes(new ZodValidationPipe(createRegionSchema))
  @HttpCode(HttpStatus.CREATED)
  async createRegion(@Body() body: CreateRegionBody): Promise<NoDataSuccessResponseBody> {
    const { name, slug, flag } = body

    await this.regionService.createRegion(name, slug, flag)

    return new SuccessResponseBody(HttpStatus.CREATED, 'Region created successfully')
  }

  async updateRegion() {}

  async deleteRegion() {}
}
