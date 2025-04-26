import { HttpStatus } from '@nestjs/common'
import ConventionalHttpException from './conventional-http.exception'
import ErrorCode from '../response-bodies/error-code'

export default class InvalidCredentialsException extends ConventionalHttpException {
  constructor() {
    super(HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_CREDENTIALS, 'Invalid credentials')
  }
}
