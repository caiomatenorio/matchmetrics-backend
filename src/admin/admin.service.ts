import { Injectable } from '@nestjs/common'
import AdminRole from 'src/auth/roles/admin.role'
import { UserService } from 'src/user/user.service'

@Injectable()
export class AdminService {
  constructor(private readonly userService: UserService) {}

  async promoteUser(email: string): Promise<void> {
    const userId = await this.userService.getUserIdByEmail(email)
    await this.userService.updateUserRole(userId, new AdminRole())
  }
}
