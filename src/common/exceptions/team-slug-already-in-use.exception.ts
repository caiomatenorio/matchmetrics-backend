import { HttpStatus } from '@nestjs/common'
import ConventionalHttpException from './conventional-http.exception'
import ErrorCode from '../util/error-code'

export default class TeamSlugAlreadyInUseException extends ConventionalHttpException {
  constructor() {
    super(HttpStatus.CONFLICT, ErrorCode.TEAM_SLUG_ALREADY_IN_USE, 'Team slug already in use')
  }
}
