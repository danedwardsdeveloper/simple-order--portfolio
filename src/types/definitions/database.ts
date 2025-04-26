import type { drizzle } from 'drizzle-orm/node-postgres'

export type DrizzleClient = ReturnType<typeof drizzle>
export type Transaction = Parameters<Parameters<DrizzleClient['transaction']>[0]>[0]
export type QueryRunner = DrizzleClient | Transaction
