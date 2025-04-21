import { Controller, Get, HttpStatus, Query, Req, UsePipes } from '@nestjs/common'
import { ChampionshipsService } from './championships.service'
import SuccessResponseBody from 'src/common/response-bodies/success-response-body'
import { Championship } from 'generated/prisma'
import { ZodValidationPipe } from 'src/zod-validation/zod-validation.pipe'
import { GetChampionshipsQuery, getChampionshipsQuerySchema } from './championship.schema'
import { Request } from 'express'
import { MinimumRole } from 'src/auth/auth.decorator'
import Role from 'src/auth/roles'

@Controller('championships')
export class ChampionshipsController {
  constructor(private readonly championshipsService: ChampionshipsService) {}

  @MinimumRole(Role.GUEST)
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
