import { emptyToNull } from '@/library/utilities/public'
import { inArray } from '@/library/utilities/server'
import type { DangerousBaseUser, NonEmptyArray } from '@/types'
import { database } from '../../connection'
import { users } from '../../schema'

export async function getUsers(userIds: NonEmptyArray<number> | null): Promise<NonEmptyArray<DangerousBaseUser> | null> {
	if (!userIds) return null

	const profiles = await database.select().from(users).where(inArray(users.id, userIds))

	return emptyToNull(profiles)
}
