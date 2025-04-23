import { $Enums } from 'generated/prisma'
import AuthenticatedRole from './authenticated.role'

export default class Admin extends AuthenticatedRole {
  readonly name = 'admin'
  readonly hierarchy = 2
  readonly authenticated = true

  toPrismaRole(): $Enums.Role {
    return $Enums.Role.ADMIN
  }
}
