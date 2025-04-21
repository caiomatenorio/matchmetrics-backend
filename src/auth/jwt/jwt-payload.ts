import { AuthenticatedRole } from '../roles'

export default interface JwtPayload {
  sub: string
  userId: string
  email: string
  role: AuthenticatedRole
}
