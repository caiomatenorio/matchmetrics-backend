import { HttpStatus } from '@nestjs/common'
import ErrorResponseBody from '../response-bodies/error-response-body'
import ConventionalHttpException from './conventional-http.exception'
import ErrorCode from '../response-bodies/error-code'
import Role from 'src/auth/roles/role'
import AuthenticatedRole from 'src/auth/roles/authenticated.role'

export default class RoleUnauthorizedException extends ConventionalHttpException {
  constructor(currentRole: Role, minimumRole: AuthenticatedRole) {
    super(
      new ErrorResponseBody(
        HttpStatus.UNAUTHORIZED,
        ErrorCode.ROLE_UNAUTHORIZED,
        `${currentRole.name} role is not authorized to access this resource. Minimum required role: ${minimumRole.name}`
      )
    )
  }
}
