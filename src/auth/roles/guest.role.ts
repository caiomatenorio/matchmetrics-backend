import UnauthenticatedRole from './unauthenticated.role'

export default class GuestRole extends UnauthenticatedRole {
  readonly name = 'guest'
  readonly hierarchy = 0
}
