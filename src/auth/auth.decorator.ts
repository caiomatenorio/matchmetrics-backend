import { SetMetadata } from '@nestjs/common'
import Role from './roles'

export const AUTH_KEY = 'roles'
export const MinimumRole = (minimumRole: Role) => SetMetadata(AUTH_KEY, minimumRole)
