import { eq as equals } from 'drizzle-orm'

import { users } from '@/library/database/schema'

import { DrizzleTransaction } from '@/types'

export async function checkAuthorisation(
  tx: DrizzleTransaction,
  userId: number,
): Promise<{ userExists: boolean; emailConfirmed: boolean }> {
  const [existingUser] = await tx.select().from(users).where(equals(users.id, userId)).limit(1)

  return {
    userExists: !!existingUser,
    emailConfirmed: !!existingUser?.emailConfirmed,
  }
}
