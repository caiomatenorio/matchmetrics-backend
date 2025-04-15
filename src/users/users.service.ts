import { Injectable } from '@nestjs/common'
import EmailAlreadyInUseException from 'src/common/exceptions/email-already-in-use.exception'
import { PrismaService } from 'src/prisma/prisma.service'
import * as argon2 from 'argon2'

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(email: string, password: string): Promise<void> {
    const isEmailInUse = await this.isEmailInUse(email)
    if (isEmailInUse) throw new EmailAlreadyInUseException(email)

    const encryptedPassword = await argon2.hash(password)

    await this.prismaService.user.create({
      data: {
        email,
        encryptedPassword,
      },
    })
  }

  async isEmailInUse(email: string): Promise<boolean> {
    const admin = await this.prismaService.user.findUnique({
      where: { email },
      select: { id: true },
    })

    return !!admin
  }
}
