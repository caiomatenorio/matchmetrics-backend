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
import { MatchService } from './match.service'
import { AdminOnly } from 'src/auth/auth.decorator'
import { ZodValidationPipe } from 'src/zod-validation/zod-validation.pipe'
import {
  CreateMatchBody,
  createMatchSchema,
  DeleteMatchParams,
  deleteMatchParamsSchema,
  UpdateMatchBody,
  UpdateMatchParams,
  updateMatchParamsSchema,
  updateMatchSchema,
} from './match.schema'
import SuccessResponseBody, {
  NoDataSuccessResponseBody,
} from 'src/common/response-bodies/success-response-body'

@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @AdminOnly()
  @Post()
  @UsePipes(new ZodValidationPipe(createMatchSchema))
  @HttpCode(HttpStatus.CREATED)
  async createMatch(@Body() body: CreateMatchBody): Promise<SuccessResponseBody<{ id: string }>> {
    const { championshipSlug, homeTeam, awayTeam, date } = body

    const data = await this.matchService.createMatch(championshipSlug, homeTeam, awayTeam, date)

    return new SuccessResponseBody(HttpStatus.CREATED, 'Match created successfully', data)
  }

  @AdminOnly()
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateMatch(
    @Param(new ZodValidationPipe(updateMatchParamsSchema)) params: UpdateMatchParams,
    @Body(new ZodValidationPipe(updateMatchSchema)) body: UpdateMatchBody
  ): Promise<NoDataSuccessResponseBody> {
    const { championshipSlug, homeTeam, awayTeam, date } = body

    await this.matchService.updateMatch(params.id, championshipSlug, homeTeam, awayTeam, date)

    return new SuccessResponseBody(HttpStatus.OK, 'Match updated successfully')
  }

  @AdminOnly()
  @Delete(':id')
  @UsePipes(new ZodValidationPipe(deleteMatchParamsSchema))
  @HttpCode(HttpStatus.OK)
  async deleteMatch(@Param() params: DeleteMatchParams): Promise<NoDataSuccessResponseBody> {
    await this.matchService.deleteMatch(params.id)

    return new SuccessResponseBody(HttpStatus.OK, 'Match deleted successfully')
  }
}
