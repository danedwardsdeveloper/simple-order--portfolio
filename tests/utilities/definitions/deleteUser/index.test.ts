import { database } from '@/library/database/connection'
import { users } from '@/library/database/schema'
import type { BaseUserInsertValues } from '@/types'
import { beforeAll, describe, expect, test } from 'vitest'
import { deleteUser } from '.'

// ToDo: this needs to be much more comprehensive, successfully deleting a user with additional rows in every table

describe('deleteUser', async () => {
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
		await deleteUser(insertValues.email)
	})

	test('Success if nothing to delete', async () => {
		const { success } = await deleteUser('nonexistentemail@gmail.com')
		expect(success).toBe(true)
	})

	test('Delete a single user row', async () => {
		await database.insert(users).values(insertValues)
		const { success } = await deleteUser(insertValues.email)
		expect(success).toBe(true)
	})
})

/* 
pnpm vitest run tests/utilities/definitions/deleteUser
*/
