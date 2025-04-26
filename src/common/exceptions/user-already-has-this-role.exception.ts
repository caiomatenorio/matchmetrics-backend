import Role from 'src/auth/roles/role'
import ConventionalHttpException from './conventional-http.exception'
import { HttpStatus } from '@nestjs/common'
import ErrorCode from '../response-bodies/error-code'

export default class UserAlreadyHasThisRoleException extends ConventionalHttpException {
  constructor(role: Role) {
    super(
      HttpStatus.BAD_REQUEST,
      ErrorCode.USER_ALREADY_HAS_THIS_ROLE,
      `The user already has the role ${role.name}`
    )
  }
}
