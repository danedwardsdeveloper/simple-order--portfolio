import { database } from '@/library/database/connection'
import { users } from '@/library/database/schema'
import type { BaseUserInsertValues } from '@/types'
import { beforeAll, describe, expect, test } from 'vitest'
import { deleteUserSequence } from './deleteUserSequence'

describe('deleteUserSequence', async () => {
	const insertValues: BaseUserInsertValues = {
		firstName: 'Important',
		lastName: 'Person',
		email: 'importantperson@gmail.com',
		businessName: 'Important Business Corp',
		slug: 'abc-test-slug',
		hashedPassword: 'hashed_password',
		emailConfirmed: false,
		cachedTrialExpired: false,
	}

	beforeAll(async () => {
		await deleteUserSequence(insertValues.email)
	})

	test('Success if nothing to delete', async () => {
		const { success } = await deleteUserSequence('nonexistentemail@gmail.com')
		expect(success).toBe(true)
	})

	test('Delete a single user row', async () => {
		await database.insert(users).values(insertValues)
		const { success } = await deleteUserSequence(insertValues.email)
		expect(success).toBe(true)
	})
})

/* 
pnpm vitest run src/library/database/operations/definitions/deleteUserSequence
*/
