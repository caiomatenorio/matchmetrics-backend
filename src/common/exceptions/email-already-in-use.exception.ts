import { HttpStatus } from '@nestjs/common'
import ErrorResponseBody from '../response-bodies/error-response-body'
import ConventionalHttpException from './conventional-http.exception'
import ErrorCode from '../response-bodies/error-code'

export default class EmailAlreadyInUseException extends ConventionalHttpException {
  constructor(email: string) {
    super(
      new ErrorResponseBody(
        HttpStatus.CONFLICT,
        ErrorCode.EMAIL_ALREADY_IN_USE,
        `Email ${email} already in use`
      )
    )
  }
}
