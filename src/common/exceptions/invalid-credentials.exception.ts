import { HttpStatus } from '@nestjs/common'
import ErrorResponseBody from '../response-bodies/error-response-body'
import ConventionalHttpException from './conventional-http.exception'
import ErrorCode from '../response-bodies/error-code'

export default class InvalidCredentialsException extends ConventionalHttpException {
  constructor() {
    super(
      new ErrorResponseBody(
        HttpStatus.UNAUTHORIZED,
        ErrorCode.INVALID_CREDENTIALS,
        'Invalid credentials'
      )
    )
  }
}
