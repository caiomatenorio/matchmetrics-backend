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
import { TeamService } from './team.service'
import { AdminOnly } from 'src/auth/auth.decorator'
import { ZodValidationPipe } from 'src/zod-validation/zod-validation.pipe'
import SuccessResponseBody, {
  NoDataSuccessResponseBody,
} from 'src/common/response-bodies/success-response-body'
import {
  CreateTeamBody,
  createTeamSchema,
  DeleteTeamParams,
  deleteTeamParamsSchema,
  UpdateTeamBody,
  UpdateTeamParamsSchema,
  updateTeamSchema,
} from './team.schema'

@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @AdminOnly()
  @Post('')
  @UsePipes(new ZodValidationPipe(createTeamSchema))
  @HttpCode(HttpStatus.CREATED)
  async createTeam(@Body() body: CreateTeamBody): Promise<NoDataSuccessResponseBody> {
    const { name, slug, shield } = body

    await this.teamService.createTeam(name, slug, shield)

    return new SuccessResponseBody(HttpStatus.CREATED, 'Team created successfully')
  }

  @AdminOnly()
  @Put(':slug')
  @HttpCode(HttpStatus.OK)
  async updateTeam(
    @Param(new ZodValidationPipe(updateTeamSchema)) params: UpdateTeamParamsSchema,
    @Body(new ZodValidationPipe(updateTeamSchema)) body: UpdateTeamBody
  ): Promise<NoDataSuccessResponseBody> {
    const { name, newSlug, shield } = body

    await this.teamService.updateTeam(params.slug, name, newSlug, shield)

    return new SuccessResponseBody(HttpStatus.OK, 'Team updated successfully')
  }

  @AdminOnly()
  @Delete(':slug')
  @UsePipes(new ZodValidationPipe(deleteTeamParamsSchema))
  @HttpCode(HttpStatus.OK)
  async deleteTeam(@Param() params: DeleteTeamParams): Promise<NoDataSuccessResponseBody> {
    await this.teamService.deleteTeam(params.slug)

    return new SuccessResponseBody(HttpStatus.OK, 'Team deleted successfully')
  }
}
