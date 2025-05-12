import { database } from '@/library/database/connection'
import { orderItems, orders } from '@/library/database/schema'
import { equals } from '@/library/utilities/server'
import type { DangerousBaseUser, Product, TestUserInputValues } from '@/types'
import { addProducts, createTestUser, deleteUser } from '@tests/utilities'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { createOrder } from '.'

describe('Create order', () => {
	const betteDavisInputValues: TestUserInputValues = {
		firstName: 'Bette',
		lastName: 'Davis',
		businessName: 'Bette Davis Pictures',
		email: 'bette@davis.com',
		password: 'AllAb0ut3ve!',
	}

	const juliaDavisInputValues: TestUserInputValues = {
		firstName: 'Julia',
		lastName: 'Davis',
		businessName: 'Julia Davis Productions',
		email: 'julia@davis.com',
		password: 'Nighty!N1ght',
	}

	let juliaDavis: DangerousBaseUser | undefined
	let betteDavisId: number | undefined
	let addedProducts: Product[] | undefined

	beforeAll(async () => {
		const { createdUser: betteDavis } = await createTestUser(betteDavisInputValues)
		betteDavisId = betteDavis.id
		const { createdUser } = await createTestUser(juliaDavisInputValues)
		juliaDavis = createdUser

		addedProducts = await addProducts([
			{
				ownerId: juliaDavis.id,
				name: 'Thrush buns in a thick, dark gravy',
				priceInMinorUnits: 396,
			},
		])
	})

	afterAll(async () => {
		await deleteUser(betteDavisInputValues.email)
		await deleteUser(juliaDavisInputValues.email)
	})

	test('createOrder', async () => {
		if (!betteDavisId || !juliaDavis) throw new Error('Failed to create new users')
		if (!addedProducts) throw new Error('Failed to add products')

		const createdOrder = await createOrder({
			customerId: betteDavisId,
			merchantProfile: juliaDavis,
			requestedDeliveryDate: new Date(),
			products: [
				{
					productId: addedProducts[0].id,
					quantity: 10,
				},
			],
		})

		// Check the return value
		expect(createdOrder).toHaveProperty('products')
		expect(createdOrder?.products.length).toBe(1)
		expect(createdOrder?.products[0].name).toBe('Thrush buns in a thick, dark gravy')

		// Check what's actually in the database
		const retrievedOrderArray = await database.select().from(orders).where(equals(orders.merchantId, juliaDavis.id))
		expect(retrievedOrderArray.length).toBe(1)

		const retrievedOrder = retrievedOrderArray[0]

		const retrievedOrderItemsArray = await database.select().from(orderItems).where(equals(orderItems.orderId, retrievedOrder.id))

		expect(retrievedOrderItemsArray.length).toBe(1)

		const retrievedOrderItems = retrievedOrderItemsArray[0]
		expect(retrievedOrderItems.quantity).toBe(10)
	})
})

/* 
pnpm vitest src/library/database/operations/definitions/createOrder
*/
