import { PrismaClient } from 'generated/prisma'

type TransactionPrismaClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>

export default TransactionPrismaClient
