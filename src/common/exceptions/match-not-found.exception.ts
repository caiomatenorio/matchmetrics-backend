import { HttpStatus } from '@nestjs/common'
import ErrorCode from '../util/error-code'
import ConventionalHttpException from './conventional-http.exception'

export default class MatchNotFoundException extends ConventionalHttpException {
  constructor() {
    super(HttpStatus.NOT_FOUND, ErrorCode.MATCH_NOT_FOUND, 'Match not found')
  }
}
