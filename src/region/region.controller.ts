import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UsePipes,
} from '@nestjs/common'
import { AdminOnly } from 'src/auth/auth.decorator'
import { ZodValidationPipe } from 'src/zod-validation/zod-validation.pipe'
import {
  CreateRegionBody,
  createRegionSchema,
  deleteRegionParamsSchema,
  UpdateRegionBody,
  UpdateRegionParams,
  updateRegionParamsSchema,
  updateRegionSchema,
} from './region.schema'
import SuccessResponseBody, {
  NoDataSuccessResponseBody,
} from 'src/common/response-bodies/success-response-body'
import { RegionService } from './region.service'
import { DeleteChampionshipParams } from 'src/championship/championship.schema'

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

  @AdminOnly()
  @Put(':slug')
  @HttpCode(HttpStatus.OK)
  async updateRegion(
    @Param(new ZodValidationPipe(updateRegionParamsSchema)) params: UpdateRegionParams,
    @Body(new ZodValidationPipe(updateRegionSchema)) body: UpdateRegionBody
  ): Promise<NoDataSuccessResponseBody> {
    const { slug } = params
    const { name, newSlug, flag } = body

    await this.regionService.updateRegion(slug, name, newSlug, flag)

    return new SuccessResponseBody(HttpStatus.OK, 'Region updated successfully')
  }

  @AdminOnly()
  @Delete(':slug')
  @UsePipes(new ZodValidationPipe(deleteRegionParamsSchema))
  @HttpCode(HttpStatus.OK)
  async deleteRegion(@Param() params: DeleteChampionshipParams) {
    const { slug } = params

    await this.regionService.deleteRegion(slug)

    return new SuccessResponseBody(HttpStatus.OK, 'Region deleted successfully')
  }
}
