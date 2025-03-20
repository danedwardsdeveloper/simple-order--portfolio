import { database } from '@/library/database/connection'
import { users } from '@/library/database/schema'
import { equals } from '@/library/utilities/server'
import type { DangerousBaseUser } from '@/types'

export async function checkUserExists(userId: number): Promise<{ userExists: boolean; existingDangerousUser?: DangerousBaseUser }> {
	// This code correctly handles cases where the user isn't found.
	// No need to worry about empty arrays being truthy here
	const [existingDangerousUser] = await database.select().from(users).where(equals(users.id, userId))

	if (!existingDangerousUser) return { userExists: false }
	return { userExists: true, existingDangerousUser }
}
