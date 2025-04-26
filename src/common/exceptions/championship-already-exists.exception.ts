import { HttpStatus } from '@nestjs/common'
import ConventionalHttpException from './conventional-http.exception'
import ErrorCode from '../util/error-code'

export default class ChampionshipAlreadyExistsException extends ConventionalHttpException {
  constructor() {
    super(
      HttpStatus.CONFLICT,
      ErrorCode.CHAMPIONSHIP_ALREADY_EXISTS,
      'Championship with specified slug already exists'
    )
  }
}
