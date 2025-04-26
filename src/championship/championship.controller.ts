import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UsePipes,
} from '@nestjs/common'
import { ChampionshipService } from './championship.service'
import SuccessResponseBody, {
  NoDataSuccessResponseBody,
} from 'src/common/response-bodies/success-response-body'
import { Championship } from 'generated/prisma'
import { ZodValidationPipe } from 'src/zod-validation/zod-validation.pipe'
import {
  CreateChampionshipBody,
  createChampionshipSchema,
  GetChampionshipBySlugParams,
  getChampionshipBySlugParamsSchema,
  GetChampionshipsQuery,
  getChampionshipsQuerySchema,
} from './championship.schema'
import { Request } from 'express'
import { AdminOnly, Public } from 'src/auth/auth.decorator'

@Controller('championships')
export class ChampionshipController {
  constructor(private readonly championshipsService: ChampionshipService) {}

  @Public()
  @Get()
  @UsePipes(new ZodValidationPipe(getChampionshipsQuerySchema))
  @HttpCode(HttpStatus.OK)
  async getAllChampionships(
    @Req() request: Request,
    @Query() query: GetChampionshipsQuery
  ): Promise<SuccessResponseBody<(Championship & { favorited: boolean })[]>> {
    const championships = await this.championshipsService.getAllChampionships(request, query)

    return new SuccessResponseBody(
      HttpStatus.OK,
      'Championships fetched successfully',
      championships
    )
  }

  @Public()
  @Get('/:slug')
  @UsePipes(new ZodValidationPipe(getChampionshipBySlugParamsSchema))
  @HttpCode(HttpStatus.OK)
  async getChampionshipBySlug(
    @Param() params: GetChampionshipBySlugParams
  ): Promise<SuccessResponseBody<Championship>> {
    const championship = await this.championshipsService.getChampionshipBySlug(params.slug)

    return new SuccessResponseBody(HttpStatus.OK, 'Championship fetched successfully', championship)
  }

  @AdminOnly()
  @Post()
  @UsePipes(new ZodValidationPipe(createChampionshipSchema))
  @HttpCode(HttpStatus.CREATED)
  async createChampionship(
    @Body() body: CreateChampionshipBody
  ): Promise<NoDataSuccessResponseBody> {
    const { name, slug, season, countrySlug } = body
    await this.championshipsService.createChampionship(name, slug, season, countrySlug)

    return new SuccessResponseBody(HttpStatus.CREATED, 'Championship created successfully')
  }
}
