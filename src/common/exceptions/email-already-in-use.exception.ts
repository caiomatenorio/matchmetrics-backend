import { HttpStatus } from '@nestjs/common'
import ConventionalHttpException from './conventional-http.exception'
import ErrorCode from '../response-bodies/error-code'

export default class EmailAlreadyInUseException extends ConventionalHttpException {
  constructor() {
    super(HttpStatus.CONFLICT, ErrorCode.EMAIL_ALREADY_IN_USE, `Email already in use`)
  }
}
