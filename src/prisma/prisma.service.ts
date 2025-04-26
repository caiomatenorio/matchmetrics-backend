import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from 'generated/prisma'
import TransactionablePrismaClient from 'src/common/util/transaction-prisma-client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }

  /**
   * Check if the Prisma client is inside a transaction.
   * @param transactionPrismaClient - The Prisma client instance to check
   * @returns transaction prisma client if it is inside a transaction, otherwise returns the normal Prisma client
   */
  checkTransaction(transactionPrismaClient?: TransactionablePrismaClient) {
    if (!transactionPrismaClient) return this
    return transactionPrismaClient
  }
}
