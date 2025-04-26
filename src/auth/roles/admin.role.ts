import { $Enums } from 'generated/prisma'
import AuthenticatedRole from './authenticated.role'

export default class AdminRole extends AuthenticatedRole {
  readonly name = 'admin'
  readonly hierarchy = 2
  readonly authenticated = true

  toPrismaRole(): $Enums.Role {
    return $Enums.Role.ADMIN
  }
}
