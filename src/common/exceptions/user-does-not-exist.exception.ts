import { HttpStatus } from '@nestjs/common'
import ErrorResponseBody from '../response-bodies/error-response-body'
import ConventionalHttpException from './conventional-http.exception'
import ErrorCode from '../response-bodies/error-code'

export default class UserDoesNotExistException extends ConventionalHttpException {
  constructor() {
    super(
      new ErrorResponseBody(
        HttpStatus.NOT_FOUND,
        ErrorCode.USER_DOES_NOT_EXIST,
        'User does not exist'
      )
    )
  }
}
