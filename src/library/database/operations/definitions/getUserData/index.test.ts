import { createTestSubscription } from '@/library/utilities/server'
import type { DangerousBaseUser, Roles, TestUserInputValues, UserData } from '@/types'
import { cedarPlanks, copperPipe, gingerBeer, porcelainTiles, truffleHoney, vanillaPaste } from '@tests/constants'
import { addProducts, createRelationship, createTestUser, deleteUser } from '@tests/utilities'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { getUserData } from '.'
import { createFreeTrial } from '../freeTrial'

describe('getUserData', () => {
	let result: UserData

	const merchantValues: TestUserInputValues = {
		firstName: 'Fa',
		lastName: 'Mulan',
		businessName: 'Dynasty Warriors',
		email: 'mulan@china.com',
		password: 'R3flect!on',
	}
	let merchant: DangerousBaseUser

	const customerValues: TestUserInputValues = {
		firstName: 'Jasmine',
		lastName: 'Sultan',
		businessName: 'Agrabah Bazaar',
		email: 'jasmine@palace.com',
		password: 'Carpet!R1de',
	}
	let customer: DangerousBaseUser

	const bothValues: TestUserInputValues = {
		firstName: 'Cher',
		lastName: '',
		businessName: 'Believe Productions',
		email: 'cher@believe.com',
		password: 'LifeAfterL0ve!',
	}
	let both: DangerousBaseUser

	function assertUser(user?: DangerousBaseUser): DangerousBaseUser {
		if (!user) throw new Error('User not defined')
		return user
	}

	beforeAll(async () => {
		merchant = (await createTestUser(merchantValues)).createdUser
		customer = (await createTestUser(customerValues)).createdUser
		both = (await createTestUser(bothValues)).createdUser

		await createFreeTrial({ userId: merchant.id })

		await addProducts([
			{ ...gingerBeer, ownerId: merchant.id },
			{ ...truffleHoney, ownerId: merchant.id },
			{ ...vanillaPaste, ownerId: merchant.id },
		])

		await createTestSubscription(both.id)

		await addProducts([
			{ ...cedarPlanks, ownerId: merchant.id },
			{ ...copperPipe, ownerId: merchant.id },
			{ ...porcelainTiles, ownerId: merchant.id },
		])

		await createRelationship({
			customerId: customer.id,
			merchantId: merchant.id,
		})
		await createRelationship({
			customerId: both.id,
			merchantId: merchant.id,
		})
		await createRelationship({
			customerId: customer.id,
			merchantId: both.id,
		})
		// Create a relationships
		//
		// Create a free trial
		// Add some products
	})

	afterAll(async () => {
		await deleteUser(bothValues.email)
		await deleteUser(merchantValues.email)
		await deleteUser(customerValues.email)
	})
	describe('Return values', async () => {
		const cases = [
			{
				caseDescription: 'Merchant',
				getUser: () => merchant,
				assertions: async () => {
					expect(result).toHaveProperty('user')
					expect(result.user?.roles).toEqual('merchant' satisfies Roles)

					expect(result).toHaveProperty('confirmedCustomers')
					expect(result.confirmedCustomers?.length).toBe(2)
					expect(result.confirmedCustomers).toEqual(
						expect.arrayContaining([
							expect.objectContaining({ businessName: 'Agrabah Bazaar' }),
							expect.objectContaining({ businessName: 'Believe Productions' }),
						]),
					)

					expect(result).toHaveProperty('confirmedMerchants')
					expect(result.confirmedMerchants).toBeNull()

					expect(result).toHaveProperty('invitationsSent')
					expect(result).toHaveProperty('invitationsReceived')
					expect(result).toHaveProperty('ordersMade')
					expect(result).toHaveProperty('ordersReceived')
				},
			},
			{
				caseDescription: 'Customer',
				getUser: () => customer,
				assertions: async () => {
					expect(result).toHaveProperty('user')
					expect(result.user?.roles).toEqual('customer' satisfies Roles)

					expect(result.confirmedCustomers).toBeNull()

					expect(result).toHaveProperty('confirmedMerchants')
					expect(result.confirmedMerchants?.length).toBe(2)

					expect(result.invitationsSent).toBeNull()
					expect(result).toHaveProperty('invitationsReceived')
					expect(result).toHaveProperty('ordersMade')
					expect(result.ordersReceived).toBeNull()
				},
			},
			{
				caseDescription: 'Both',
				getUser: () => both,
				assertions: async () => {
					expect(result).toHaveProperty('user')
					expect(result.user?.roles).toEqual('both' satisfies Roles)

					expect(result).toHaveProperty('confirmedCustomers')
					expect(result.confirmedCustomers).toEqual(expect.arrayContaining([expect.objectContaining({ businessName: 'Agrabah Bazaar' })]))

					expect(result).toHaveProperty('confirmedMerchants')
					expect(result.confirmedMerchants?.length).toBe(1)

					expect(result).toHaveProperty('invitationsSent')
					expect(result).toHaveProperty('invitationsReceived')
					expect(result).toHaveProperty('ordersMade')
					expect(result).toHaveProperty('ordersReceived')
				},
			},
		]

		for (const { caseDescription, getUser, assertions } of cases) {
			test(caseDescription, async () => {
				result = await getUserData(assertUser(getUser()))
				await assertions()
			})
		}
	})
})

/*
'invitationsSent'
'invitationsReceived'
'ordersMade'
'ordersReceived'
*/

/* 
pnpm vitest src/library/database/operations/definitions/getUserData
*/
