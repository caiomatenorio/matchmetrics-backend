import { Body, Controller, HttpCode, HttpStatus, Post, UsePipes } from '@nestjs/common'
import { TeamService } from './team.service'
import { AdminOnly } from 'src/auth/auth.decorator'
import { ZodValidationPipe } from 'src/zod-validation/zod-validation.pipe'
import SuccessResponseBody, {
  NoDataSuccessResponseBody,
} from 'src/common/response-bodies/success-response-body'
import { CreateTeamBody, createTeamSchema } from './team.schema'

@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @AdminOnly()
  @Post('create')
  @UsePipes(new ZodValidationPipe(createTeamSchema))
  @HttpCode(HttpStatus.CREATED)
  async createTeam(@Body() body: CreateTeamBody): Promise<NoDataSuccessResponseBody> {
    const { name, slug, shield } = body

    await this.teamService.createTeam(name, slug, shield)

    return new SuccessResponseBody(HttpStatus.CREATED, 'Team created successfully')
  }
}
