import { database } from '@/library/database/connection'
import { users } from '@/library/database/schema'
import type { DangerousBaseUser } from '@/types'
import { eq } from 'drizzle-orm'

export async function checkUserExists(userId: number): Promise<{ userExists: boolean; existingDangerousUser?: DangerousBaseUser }> {
	const [existingDangerousUser] = await database.select().from(users).where(eq(users.id, userId)).limit(1)

	if (!existingDangerousUser) return { userExists: false }
	return { userExists: true, existingDangerousUser }
}
