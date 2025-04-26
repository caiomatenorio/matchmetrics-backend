import { Controller, Get, HttpCode, HttpStatus, Param, Query, Req, UsePipes } from '@nestjs/common'
import { ChampionshipsService } from './championships.service'
import SuccessResponseBody from 'src/common/response-bodies/success-response-body'
import { Championship } from 'generated/prisma'
import { ZodValidationPipe } from 'src/zod-validation/zod-validation.pipe'
import {
  GetChampionshipBySlugParams,
  getChampionshipBySlugParamsSchema,
  GetChampionshipsQuery,
  getChampionshipsQuerySchema,
} from './championship.schema'
import { Request } from 'express'
import { Public } from 'src/auth/auth.decorator'

@Controller('championships')
export class ChampionshipsController {
  constructor(private readonly championshipsService: ChampionshipsService) {}

  @Public()
  @Get()
  @UsePipes(new ZodValidationPipe(getChampionshipsQuerySchema))
  @HttpCode(HttpStatus.OK)
  async getAllChampionships(
    @Req() request: Request,
    @Query() query: GetChampionshipsQuery
  ): Promise<
    SuccessResponseBody<(Omit<Championship, 'start' | 'end'> & { favorited: boolean })[]>
  > {
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
}
