import { SetMetadata } from '@nestjs/common'
import GuestRole from './roles/guest.role'
import UserRole from './roles/user.role'
import AdminRole from './roles/admin.role'

export const AUTH_KEY = 'roles'
export const Public = () => SetMetadata(AUTH_KEY, new GuestRole())
export const Authenticated = () => SetMetadata(AUTH_KEY, new UserRole())
export const AdminOnly = () => SetMetadata(AUTH_KEY, new AdminRole())
