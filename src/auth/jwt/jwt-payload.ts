import AuthenticatedRole from '../roles/authenticated.role'

export default interface JwtPayload {
  sub: string
  userId: string
  email: string
  role: AuthenticatedRole
}
