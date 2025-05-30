import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UsePipes,
} from '@nestjs/common'
import {
  ChampionshipService,
  ChampionshipWithRegion,
  ChampionshipWithCountryAndFavoritedStatus,
  MatchWithTeams,
} from './championship.service'
import SuccessResponseBody, {
  NoDataSuccessResponseBody,
} from 'src/common/response-bodies/success-response-body'
import { ZodValidationPipe } from 'src/zod-validation/zod-validation.pipe'
import {
  CreateChampionshipBody,
  createChampionshipSchema,
  GetChampionshipBySlugParams,
  getChampionshipBySlugParamsSchema,
  GetChampionshipMatchesParams,
  getChampionshipMatchesParamsSchema,
  GetChampionshipMatchesQuery,
  getChampionshipMatchesQuerySchema,
  GetChampionshipsQuery,
  getChampionshipsQuerySchema,
  UpdateChampionshipBody,
  updateChampionshipSchema,
  UpdateChampionshipParams,
  updateChampionshipParamsSchema,
  DeleteChampionshipParams,
  deleteChampionshipParamsSchema,
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
  ): Promise<SuccessResponseBody<ChampionshipWithCountryAndFavoritedStatus[]>> {
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
  ): Promise<SuccessResponseBody<ChampionshipWithRegion>> {
    const championship = await this.championshipsService.getChampionshipBySlug(params.slug)

    return new SuccessResponseBody(HttpStatus.OK, 'Championship fetched successfully', championship)
  }

  @Public()
  @Get('/:slug/matches')
  @HttpCode(HttpStatus.OK)
  async getChampionshipMatches(
    @Param(new ZodValidationPipe(getChampionshipMatchesParamsSchema))
    params: GetChampionshipMatchesParams,
    @Query(new ZodValidationPipe(getChampionshipMatchesQuerySchema))
    query: GetChampionshipMatchesQuery
  ): Promise<SuccessResponseBody<MatchWithTeams[]>> {
    const matches = await this.championshipsService.getChampionshipMatches(params.slug, query)

    return new SuccessResponseBody(HttpStatus.OK, 'Matches fetched successfully', matches)
  }

  @AdminOnly()
  @Post()
  @UsePipes(new ZodValidationPipe(createChampionshipSchema))
  @HttpCode(HttpStatus.CREATED)
  async createChampionship(
    @Body() body: CreateChampionshipBody
  ): Promise<NoDataSuccessResponseBody> {
    const { name, slug, season, regionSlug } = body
    await this.championshipsService.createChampionship(name, slug, season, regionSlug)

    return new SuccessResponseBody(HttpStatus.CREATED, 'Championship created successfully')
  }

  @AdminOnly()
  @Put(':slug')
  @HttpCode(HttpStatus.OK)
  async updateChampionship(
    @Param(new ZodValidationPipe(updateChampionshipParamsSchema)) params: UpdateChampionshipParams,
    @Body(new ZodValidationPipe(updateChampionshipSchema)) body: UpdateChampionshipBody
  ): Promise<NoDataSuccessResponseBody> {
    const { slug } = params
    const { name, newSlug, season, regionSlug } = body

    await this.championshipsService.updateChampionship(slug, name, newSlug, season, regionSlug)

    return new SuccessResponseBody(HttpStatus.OK, 'Championship updated successfully')
  }

  @AdminOnly()
  @Delete(':slug')
  @UsePipes(new ZodValidationPipe(deleteChampionshipParamsSchema))
  @HttpCode(HttpStatus.OK)
  async deleteChampionship(
    @Param() params: DeleteChampionshipParams
  ): Promise<NoDataSuccessResponseBody> {
    const { slug } = params

    await this.championshipsService.deleteChampionship(slug)

    return new SuccessResponseBody(HttpStatus.OK, 'Championship deleted successfully')
  }
}
