import { $Enums } from 'generated/prisma'

enum Role {
  GUEST,
  USER,
  ADMIN,
}

export type AuthenticatedRole = Role.USER | Role.ADMIN

export function convertPrismaRoleToRole(role: $Enums.Role): Role.USER | Role.ADMIN {
  switch (role) {
    case 'USER':
      return Role.USER
    case 'ADMIN':
      return Role.ADMIN
  }
}

export function convertRoleToPrismaRole(role: Role.ADMIN | Role.USER): $Enums.Role {
  switch (role) {
    case Role.USER:
      return 'USER'
    case Role.ADMIN:
      return 'ADMIN'
  }
}

export function convertRoleToString(role: Role): string {
  switch (role) {
    case Role.GUEST:
      return 'GUEST'
    case Role.USER:
      return 'USER'
    case Role.ADMIN:
      return 'ADMIN'
  }
}

export default Role
