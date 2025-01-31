import { eq } from 'drizzle-orm'
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'

import { users } from '@/library/database/schema'

export function checkAuthorisation(
  tx: BetterSQLite3Database,
  userId: number,
): { userExists: boolean; emailConfirmed: boolean } {
  const existingUser = tx
    .select({
      emailConfirmed: users.emailConfirmed,
    })
    .from(users)
    .where(eq(users.id, userId))
    .get()

  return {
    userExists: !!existingUser,
    emailConfirmed: !!existingUser?.emailConfirmed,
  }
}
