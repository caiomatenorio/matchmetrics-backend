import { SetMetadata } from '@nestjs/common'
import Guest from './roles/guest.role'
import User from './roles/user.role'
import Admin from './roles/admin.role'

export const AUTH_KEY = 'roles'
export const Public = () => SetMetadata(AUTH_KEY, new Guest())
export const Authenticated = () => SetMetadata(AUTH_KEY, new User())
export const AdminOnly = () => SetMetadata(AUTH_KEY, new Admin())
