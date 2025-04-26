import { HttpStatus } from '@nestjs/common'
import ConventionalHttpException from './conventional-http.exception'
import ErrorCode from '../util/error-code'
import Role from 'src/auth/roles/role'
import AuthenticatedRole from 'src/auth/roles/authenticated.role'

export default class RoleUnauthorizedException extends ConventionalHttpException {
  constructor(currentRole: Role, minimumRole: AuthenticatedRole) {
    super(
      HttpStatus.UNAUTHORIZED,
      ErrorCode.ROLE_UNAUTHORIZED,
      `The minimum required role is ${minimumRole.name}, but the current role is ${currentRole.name}`
    )
  }
}
