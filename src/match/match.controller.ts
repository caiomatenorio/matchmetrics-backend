import { Body, Controller, HttpCode, HttpStatus, Post, UsePipes } from '@nestjs/common'
import { MatchService } from './match.service'
import { AdminOnly } from 'src/auth/auth.decorator'
import { ZodValidationPipe } from 'src/zod-validation/zod-validation.pipe'
import { CreateMatchBody, createMatchSchema } from './match.schema'
import { CreateTeamBody } from 'src/team/team.schema'
import SuccessResponseBody from 'src/common/response-bodies/success-response-body'

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
}
