import { HttpStatus } from '@nestjs/common'
import ConventionalHttpException from './conventional-http.exception'
import ErrorCode from '../util/error-code'

export default class TeamNotFoundException extends ConventionalHttpException {
  constructor() {
    super(HttpStatus.NOT_FOUND, ErrorCode.TEAM_NOT_FOUND, 'Team not found')
  }
}
