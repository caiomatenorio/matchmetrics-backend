import Role from './role'

export default abstract class UnauthenticatedRole extends Role {
  readonly authenticated: boolean = false
}
