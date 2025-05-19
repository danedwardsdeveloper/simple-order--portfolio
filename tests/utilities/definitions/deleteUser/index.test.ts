import { database } from '@/library/database/connection'
import { freeTrials, invitations, products, subscriptions } from '@/library/database/schema'
import { createSubscription, equals, or } from '@/library/utilities/server'
import type { AsyncFunction, DangerousBaseUser, TestUserInputValues } from '@/types'
import { describe, expect, test } from 'vitest'
import { deleteUser } from '.'
import { createUser } from '../../../../src/library/database/operations/definitions/createUser'
import { addProducts } from '../products'

const inputValues: TestUserInputValues = {
	firstName: 'Imelda',
	lastName: 'Staunton',
	email: 'imeldastaunton@gmail.com',
	businessName: 'Imelda Staunton Incorporated',
	password: 'secretPassword123',
	emailConfirmed: false,
}

type Suite = {
	description: string
	suiteSetUp?: AsyncFunction
	tearDown?: AsyncFunction
	cases: Case[]
}

type Case = {
	description: string
	caseSetUp?: AsyncFunction
	assertions: AsyncFunction
}

describe('deleteUser', async () => {
	let imeldaStaunton: DangerousBaseUser | undefined

	const suites: Suite[] = [
		{
			suiteSetUp: async () => {
				await deleteUser(inputValues.email)
			},
			description: 'No set up',
			cases: [
				{
					description: "Returns 'success' if nothing to delete",
					assertions: async () => {
						const { success } = await deleteUser('nonexistentemail@gmail.com')
						expect(success).toBe(true)
					},
				},
			],
		},
		{
			description: 'Imelda Staunton',
			suiteSetUp: async () => {
				// Get the ID of the created user
				const { createdUser } = await createUser(inputValues)
				imeldaStaunton = createdUser
			},
			cases: [
				{
					description: 'Successfully deletes a user with only one row',
					assertions: async () => {
						const { success } = await deleteUser(inputValues.email)
						expect(success).toBe(true)
					},
				},
				{
					description: 'Deletes a user with a free trial, invitation, products, subscription, and relationship', // ToDo: add more checks here
					caseSetUp: async () => {
						if (!imeldaStaunton) throw new Error('User not created')

						await addProducts([
							{
								ownerId: imeldaStaunton.id,
								name: 'Soup',
								priceInMinorUnits: 500,
								customVat: 20,
							},
						])

						const { success: successfullyCreatedSubscription } = await createSubscription({
							userId: imeldaStaunton.id,
							stripeCustomerId: 'abcdefg',
							currentPeriodStart: new Date(),
							currentPeriodEnd: new Date(),
						})
						if (!successfullyCreatedSubscription) throw new Error("Failed to create Imelda Staunton's subscription")
					},
					assertions: async () => {
						if (!imeldaStaunton) throw new Error('User not created')
						const { success } = await deleteUser(inputValues.email)
						expect(success).toBe(true)

						const deletedFreeTrial = await database.select().from(freeTrials).where(
							equals(freeTrials.userId, imeldaStaunton.id), //
						)
						expect(deletedFreeTrial).toEqual([])

						const userProducts = await database.select().from(products).where(
							equals(products.ownerId, imeldaStaunton.id), //
						)
						expect(userProducts).toEqual([])

						const invitation = await database
							.select()
							.from(invitations)
							.where(
								or(
									equals(invitations.senderUserId, imeldaStaunton.id), //
									equals(invitations.email, imeldaStaunton.email),
								),
							)
						expect(invitation).toEqual([])

						const userSubscription = await database.select().from(subscriptions).where(
							equals(subscriptions.userId, imeldaStaunton.id), //
						)
						expect(userSubscription).toEqual([])
					},
				},
			],
		},
	]

	for (const { description, suiteSetUp, cases } of suites) {
		describe(description, async () => {
			if (suiteSetUp) await suiteSetUp()
			for (const { description, caseSetUp, assertions } of cases) {
				if (caseSetUp) await caseSetUp()
				test(description, async () => {
					await assertions()
				})
			}
		})
	}
})

/* 
pnpm vitest run tests/utilities/definitions/deleteUser
*/
