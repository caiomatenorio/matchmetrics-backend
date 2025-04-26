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
import {
  ChampionshipService,
  ChampionshipWithCountry,
  ChampionshipWithFavoritedStatus,
  MatchWithTeams,
  TeamWithCountry,
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
  GetChampionshipTeamsParams,
  getChampionshipTeamsParamsSchema,
  GetChampionshipTeamsQuery,
  getChampionshipTeamsQuerySchema,
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
  ): Promise<SuccessResponseBody<ChampionshipWithFavoritedStatus[]>> {
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
  ): Promise<SuccessResponseBody<ChampionshipWithCountry>> {
    const championship = await this.championshipsService.getChampionshipBySlug(params.slug)

    return new SuccessResponseBody(HttpStatus.OK, 'Championship fetched successfully', championship)
  }

  @Public()
  @Get('/:slug/teams')
  @HttpCode(HttpStatus.OK)
  async getChampionshipTeams(
    @Param(new ZodValidationPipe(getChampionshipTeamsParamsSchema))
    params: GetChampionshipTeamsParams,
    @Query(new ZodValidationPipe(getChampionshipTeamsQuerySchema)) query: GetChampionshipTeamsQuery
  ): Promise<SuccessResponseBody<TeamWithCountry[]>> {
    const teams = await this.championshipsService.getChampionshipTeams(params.slug, query.search)

    return new SuccessResponseBody(HttpStatus.OK, 'Teams fetched successfully', teams)
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
    const { name, slug, season, countrySlug } = body
    await this.championshipsService.createChampionship(name, slug, season, countrySlug)

    return new SuccessResponseBody(HttpStatus.CREATED, 'Championship created successfully')
  }
}
