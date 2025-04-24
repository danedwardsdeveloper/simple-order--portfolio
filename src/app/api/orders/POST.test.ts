import { database } from '@/library/database/connection'
import { orderItems, orders } from '@/library/database/schema'
import { equals } from '@/library/utilities/server'
import type { AnonymousProduct, DangerousBaseUser, JsonData, OrderMade, Product, TestUserInputValues } from '@/types'
import { addProducts, createUser, deleteUser, initialiseTestRequestMaker } from '@tests/utilities'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

describe('Create order', () => {
	const makeRequest = initialiseTestRequestMaker({
		basePath: '/orders',
		method: 'POST',
	})

	const merchantInputValues: TestUserInputValues = {
		firstName: 'Count',
		lastName: 'Dracula',
		businessName: 'Transylvanian Estates',
		email: 'count@dracula.com',
		password: 'Bl00dType0!',
	}

	const customerInputValues: TestUserInputValues = {
		firstName: 'Jane',
		lastName: 'Eyre',
		businessName: 'Thornfield Governesses',
		email: 'jane@thornfield.com',
		password: 'R0chester!Fire',
	}

	const anonymousProductInsertValues: AnonymousProduct[] = [{ name: 'Human blood, 5 liters', priceInMinorUnits: 9850 }]

	let merchantProfile: DangerousBaseUser | undefined
	let customerId: number | undefined
	let customerCookie: string | undefined
	let addedProducts: Product[] | undefined

	const toDoCases: { caseDescription: string }[] = [
		{ caseDescription: 'Invalid cookie' },
		{ caseDescription: 'Expired cookie' },
		// ToDo...
	]

	for (const { caseDescription } of toDoCases) {
		test.skip(caseDescription, () => {
			//
		})
	}

	beforeAll(async () => {
		const { createdUser } = await createUser(merchantInputValues)
		merchantProfile = createdUser
		const { createdUser: customer, requestCookie } = await createUser(customerInputValues)
		customerId = customer.id
		customerCookie = requestCookie

		addedProducts = await addProducts([
			{
				...anonymousProductInsertValues[0],
				ownerId: merchantProfile.id,
			},
		])
	})

	afterAll(async () => {
		await deleteUser(merchantInputValues.email)
		await deleteUser(customerInputValues.email)
	})

	test('createOrder', async () => {
		if (!merchantProfile || !customerId) throw new Error('Failed to create new users')
		if (!addedProducts) throw new Error('Failed to add products')

		const { response } = await makeRequest({
			requestCookie: customerCookie,
			body: {
				merchantSlug: merchantProfile.slug,
				requestedDeliveryDate: new Date(),
				products: [
					{
						productId: addedProducts[0].id,
						quantity: 10,
					},
				],
			},
		})

		expect(response.status).toBe(201)

		const body = (await response.json()) as JsonData
		expect(body).toHaveProperty('createdOrder')

		const createdOrder = body.createdOrder as OrderMade
		expect(createdOrder).toHaveProperty('products')

		expect(createdOrder.products.length).toBe(1)
		expect(createdOrder?.products[0].name).toBe('Human blood, 5 liters')

		const retrievedOrderArray = await database.select().from(orders).where(equals(orders.merchantId, merchantProfile.id))
		expect(retrievedOrderArray.length).toBe(1)

		const retrievedOrder = retrievedOrderArray[0]

		const retrievedOrderItemsArray = await database.select().from(orderItems).where(equals(orderItems.orderId, retrievedOrder.id))

		expect(retrievedOrderItemsArray.length).toBe(1)

		const retrievedOrderItems = retrievedOrderItemsArray[0]
		expect(retrievedOrderItems.quantity).toBe(10)
	})
})

/* 
pnpm vitest src/app/api/orders/POST
*/
