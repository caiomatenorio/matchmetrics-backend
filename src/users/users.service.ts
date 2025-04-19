import { Injectable } from '@nestjs/common'
import EmailAlreadyInUseException from 'src/common/exceptions/email-already-in-use.exception'
import { PrismaService } from 'src/prisma/prisma.service'
import UserDoesNotExistException from 'src/common/exceptions/user-does-not-exist.exception'
import * as bcrypt from 'bcrypt'
import InvalidCredentialsException from 'src/common/exceptions/invalid-credentials.exception'

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(email: string, password: string): Promise<void> {
    const isEmailInUse = await this.isEmailInUse(email)
    if (isEmailInUse) throw new EmailAlreadyInUseException(email)

    const hashedPassword = await bcrypt.hash(password, 10)
    await this.prismaService.user.create({ data: { email, password: hashedPassword } })
  }

  async isEmailInUse(email: string): Promise<boolean> {
    const admin = await this.prismaService.user.findUnique({
      where: { email },
      select: { id: true },
    })

    return !!admin
  }

  async userExists(userId: string): Promise<boolean> {
    const admin = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })

    return !!admin
  }

  async getUserEmailById(userId: string): Promise<string> {
    const { email } =
      (await this.prismaService.user.findUnique({
        where: { id: userId },
        select: { email: true },
      })) ?? {}

    if (!email) throw new UserDoesNotExistException()

    return email
  }

  async getUserIdByEmail(email: string): Promise<string> {
    const { id } =
      (await this.prismaService.user.findUnique({
        where: { email },
        select: { id: true },
      })) ?? {}

    if (!id) throw new UserDoesNotExistException()

    return id
  }

  async validateCredentials(email: string, password: string): Promise<void> {
    const admin = await this.prismaService.user.findUnique({
      where: { email },
      select: { password: true },
    })

    if (admin && (await bcrypt.compare(password, admin.password))) return

    throw new InvalidCredentialsException()
  }
}
