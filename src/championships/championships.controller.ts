import { Controller, Get, HttpStatus, Query, Req, UsePipes } from '@nestjs/common'
import { ChampionshipsService } from './championships.service'
import SuccessResponseBody from 'src/common/response-bodies/success-response-body'
import { Championship } from 'generated/prisma'
import { Public } from 'src/auth/auth.guard'
import { ZodValidationPipe } from 'src/zod-validation/zod-validation.pipe'
import { GetChampionshipsQuery, getChampionshipsQuerySchema } from './championship.schema'
import { Request } from 'express'

@Controller('championships')
export class ChampionshipsController {
  constructor(private readonly championshipsService: ChampionshipsService) {}

  @Public()
  @Get()
  @UsePipes(new ZodValidationPipe(getChampionshipsQuerySchema))
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
}
