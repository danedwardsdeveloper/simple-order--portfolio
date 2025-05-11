import { database } from '@/library/database/connection'
import { users } from '@/library/database/schema'
import logger from '@/library/logger'
import { equals } from '@/library/utilities/server'
import type { DangerousBaseUser } from '@/types'

export async function getUserFromDatabase({ email }: { email: string }): Promise<DangerousBaseUser> {
	try {
		const [foundUser] = await database.select().from(users).where(equals(users.email, email)).limit(1)

		return foundUser
	} catch (error) {
		logger.error('getUserFromDatabase error: ', error)
		throw error
	}
}
