import { HttpStatus } from '@nestjs/common'
import ConventionalHttpException from './conventional-http.exception'
import ErrorCode from '../util/error-code'

export default class ChampionshipSlugAlreadyInUseException extends ConventionalHttpException {
  constructor() {
    super(
      HttpStatus.CONFLICT,
      ErrorCode.CHAMPIONSHIP_SLUG_ALREADY_IN_USE,
      'Championship slug already in use'
    )
  }
}
