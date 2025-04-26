import { HttpStatus } from '@nestjs/common'
import ConventionalHttpException from './conventional-http.exception'
import ErrorCode from '../util/error-code'

export default class UserDoesNotExistException extends ConventionalHttpException {
  constructor() {
    super(HttpStatus.NOT_FOUND, ErrorCode.USER_DOES_NOT_EXIST, `The specified user does not exist`)
  }
}
