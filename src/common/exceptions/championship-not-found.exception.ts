import { HttpStatus } from '@nestjs/common'
import ConventionalHttpException from './conventional-http.exception'
import ErrorCode from '../util/error-code'

export default class ChampionshipNotFoundException extends ConventionalHttpException {
  constructor() {
    super(HttpStatus.NOT_FOUND, ErrorCode.CHAMPIONSHIP_NOT_FOUND, 'Championship not found')
  }
}
