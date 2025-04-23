import UnauthenticatedRole from './unauthenticated.role'

export default class Guest extends UnauthenticatedRole {
  readonly name = 'guest'
  readonly hierarchy = 0
}
