import Role from 'src/auth/roles/role'
import ConventionalHttpException from './conventional-http.exception'
import ErrorResponseBody from '../response-bodies/error-response-body'
import { HttpStatus } from '@nestjs/common'
import ErrorCode from '../response-bodies/error-code'

export default class UserAlreadyHasThisRoleException extends ConventionalHttpException {
  constructor(role: Role) {
    super(
      new ErrorResponseBody(
        HttpStatus.BAD_REQUEST,
        ErrorCode.USER_ALREADY_HAS_THIS_ROLE,
        `User already has the ${role.name} role`
      )
    )
  }
}
