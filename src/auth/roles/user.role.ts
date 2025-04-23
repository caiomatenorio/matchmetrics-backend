import { $Enums } from 'generated/prisma'
import AuthenticatedRole from './authenticated.role'

export default class UserRole extends AuthenticatedRole {
  readonly name = 'user'
  readonly hierarchy = 1
  readonly authenticated = true

  toPrismaRole(): $Enums.Role {
    return $Enums.Role.USER
  }
}
