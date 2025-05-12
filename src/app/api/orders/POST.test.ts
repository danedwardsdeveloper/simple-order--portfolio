import { http403forbidden, january } from '@/library/constants'
import { database } from '@/library/database/connection'
import { createHoliday } from '@/library/database/operations'
import { orderItems, orders } from '@/library/database/schema'
import { createDate } from '@/library/utilities/public'
import { equals } from '@/library/utilities/server'
import type { AnonymousProduct, AsyncFunction, DangerousBaseUser, OrderMade, Product, TestUserInputValues } from '@/types'
import type { JsonData } from '@tests/types'
import { addProducts, createTestUser, deleteUser, initialiseTestRequestMaker } from '@tests/utilities'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'
import type { OrdersPOSTbody } from './post'

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
let _customerId: number | undefined
let customerCookie: string | undefined
let addedProducts: Product[] | undefined

function getMerchant(): DangerousBaseUser {
	if (!merchantProfile) throw new Error('Merchant missing')
	return merchantProfile
}

function getProducts(): Product[] {
	if (!addedProducts) throw new Error('Added products missing')
	return addedProducts
}

const validBody: () => OrdersPOSTbody = () => ({
	merchantSlug: getMerchant().slug,
	requestedDeliveryDate: new Date(),
	products: [
		{
			productId: getProducts()[0].id,
			quantity: 10,
		},
	],
})

interface TestSuite {
	suiteDescription: string
	suiteExpectedStatus?: number
	suiteSetUp?: AsyncFunction
	suiteMockedTime: Date
	suiteTearDown?: AsyncFunction
	cases: TestCase[]
}

interface TestCase {
	caseDescription: string
	caseSetUp?: AsyncFunction
	caseBody: () => OrdersPOSTbody
	caseTearDown?: AsyncFunction
	assertions?: AsyncFunction
}

const suites: TestSuite[] = [
	{
		suiteDescription: 'Delivery days not accepted',
		suiteMockedTime: createDate(1, january, 2025), // Wednesday
		suiteExpectedStatus: http403forbidden,
		cases: [
			{
				caseDescription: "on a day that is'nt a regular accepted weekday",
				caseBody: () => ({
					...validBody(),
					requestedDeliveryDate: createDate(6, january, 2025), // Saturday
				}),
			},
			{
				caseDescription: 'on a merchant holiday',
				caseSetUp: async () => {
					await createHoliday(getMerchant().id, createDate(6, january, 2025))
				},
				caseBody: () => ({
					...validBody(),
					requestedDeliveryDate: createDate(6, january, 2025), // Saturday
				}),
			},
		],
	},
]

describe('POST /api/orders', () => {
	beforeAll(async () => {
		const { createdUser } = await createTestUser(merchantInputValues)
		merchantProfile = createdUser

		const { createdUser: customer, validCookie } = await createTestUser(customerInputValues)

		_customerId = customer.id
		customerCookie = validCookie

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

	for (const { suiteDescription, suiteMockedTime, cases, suiteExpectedStatus } of suites) {
		describe(suiteDescription, () => {
			beforeEach(() => vi.setSystemTime(suiteMockedTime))
			afterEach(() => vi.useRealTimers())

			for (const { caseDescription, caseBody, assertions, caseTearDown } of cases) {
				test(caseDescription, async () => {
					try {
						const { response } = await makeRequest({
							requestCookie: customerCookie,
							body: caseBody(),
						})

						if (assertions) await assertions()

						expect(response.status).toEqual(suiteExpectedStatus)
					} finally {
						if (caseTearDown) await caseTearDown()
					}
				})
			}
		})
	}

	describe.skip('ToDo: old disorganised tests', () => {
		test('createOrder', async () => {
			const { response } = await makeRequest({
				requestCookie: customerCookie,
				body: {
					merchantSlug: getMerchant().slug,
					requestedDeliveryDate: new Date(),
					products: [
						{
							productId: getProducts()[0].id,
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

			const retrievedOrderArray = await database.select().from(orders).where(equals(orders.merchantId, getMerchant().id))
			expect(retrievedOrderArray.length).toBe(1)

			const retrievedOrder = retrievedOrderArray[0]

			const retrievedOrderItemsArray = await database.select().from(orderItems).where(equals(orderItems.orderId, retrievedOrder.id))

			expect(retrievedOrderItemsArray.length).toBe(1)

			const retrievedOrderItems = retrievedOrderItemsArray[0]
			expect(retrievedOrderItems.quantity).toBe(10)
		})
	})
})

type ToDoCase = { caseDescription: string }

const _toDoCases: ToDoCase[] = [
	{ caseDescription: 'Invalid cookie' },
	{ caseDescription: 'Expired cookie' },
	{ caseDescription: 'Email not confirmed ' },
	{ caseDescription: 'Missing merchantSlug' },
	{ caseDescription: 'Missing requestedDeliveryDate' },
	{ caseDescription: 'Invalid requestedDeliveryDate' },
	{ caseDescription: 'No products' },
	{ caseDescription: 'Empty products array' },
	{ caseDescription: 'Customer note too long' },
	{ caseDescription: 'Illegal characters in customerNote' },
	{ caseDescription: 'No relationship' },
	{ caseDescription: 'Self-order' },
	{ caseDescription: 'Customer can make an order without a free trial or subscription' },
]

/* 
pnpm vitest src/app/api/orders/post
*/
