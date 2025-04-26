import { PrismaClient } from 'generated/prisma'

/**
 * This type is used to create a Prisma client that can be used inside a transaction.
 * It omits the methods that are not needed inside a transaction.
 */
type TransactionablePrismaClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>

export default TransactionablePrismaClient
