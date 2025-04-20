import { Controller, Get, HttpStatus, Query, UsePipes } from '@nestjs/common'
import { ChampionshipsService } from './championships.service'
import SuccessResponseBody from 'src/common/response-bodies/success-response-body'
import { Championship } from 'generated/prisma'
import { Public } from 'src/auth/auth.guard'
import { ZodValidationPipe } from 'src/zod-validation/zod-validation.pipe'
import { GetAllChampionshipsQuery, getAllChampionshipsQuerySchema } from './championship.schema'

@Controller('championships')
export class ChampionshipsController {
  constructor(private readonly championshipsService: ChampionshipsService) {}

  @Public()
  @Get()
  @UsePipes(new ZodValidationPipe(getAllChampionshipsQuerySchema))
  async getAllChampionships(
    @Query() query: GetAllChampionshipsQuery
  ): Promise<SuccessResponseBody<Omit<Championship, 'start' | 'end'>[]>> {
    const championships = await this.championshipsService.getAllChampionships(query)

    return new SuccessResponseBody(
      HttpStatus.OK,
      'Championships fetched successfully',
      championships
    )
  }
}
