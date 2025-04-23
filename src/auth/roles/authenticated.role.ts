import { $Enums } from 'generated/prisma'
import Role from './role'

export default abstract class AuthenticatedRole extends Role {
  readonly authenticated: boolean = true

  abstract toPrismaRole(): $Enums.Role
}
