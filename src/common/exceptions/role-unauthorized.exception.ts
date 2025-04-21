import { HttpStatus } from '@nestjs/common'
import ErrorResponseBody from '../response-bodies/error-response-body'
import ConventionalHttpException from './conventional-http.exception'
import ErrorCode from '../response-bodies/error-code'
import Role, { convertRoleToString } from 'src/auth/roles'

export default class RoleUnauthorizedException extends ConventionalHttpException {
  constructor(currentRole: Role.USER | Role.ADMIN, minimumRole: Role.USER | Role.ADMIN) {
    super(
      new ErrorResponseBody(
        HttpStatus.UNAUTHORIZED,
        ErrorCode.ROLE_UNAUTHORIZED,
        `${convertRoleToString(currentRole)} role is not authorized to access this resource. Minimum required role: ${convertRoleToString(
          minimumRole
        )}`
      )
    )
  }
}
