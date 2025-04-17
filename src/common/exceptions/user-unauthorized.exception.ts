import { HttpStatus } from '@nestjs/common'
import ErrorResponseBody from '../response-bodies/error-response-body'
import ConventionalHttpException from './conventional-http.exception'
import ErrorCode from '../response-bodies/error-code'

export default class UserUnauthorizedException extends ConventionalHttpException {
  constructor() {
    super(
      new ErrorResponseBody(
        HttpStatus.UNAUTHORIZED,
        ErrorCode.USER_UNAUTHORIZED,
        'User is unauthorized'
      )
    )
  }
}
