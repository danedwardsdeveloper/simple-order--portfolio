import { orderStatusNameToId } from '@/library/constants'
import type { OrderReceived } from '@/types'
import { describe, expect, test } from 'vitest'
import { type MapItemsToOrderInput, mapItemsToOrder } from './mapOrders'

const validInput: MapItemsToOrderInput = {
	order: {
		id: 13,
		customerId: 1,
		merchantId: 2,
		statusId: orderStatusNameToId.Pending,
		requestedDeliveryDate: new Date(),
		adminOnlyNote: 'Samantha is such an awful customer!',
		customerNote: 'Oi Jolene, give me my damn sushi!',
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	orderItems: [
		{
			id: 1,
			orderId: 13,
			productId: 99,
			quantity: 4,
			priceInMinorUnitsWithoutVat: 199,
			vat: 20,
		},
	],
	products: [
		{
			id: 99,
			name: 'Sushi',
			createdAt: new Date(),
			updatedAt: new Date(),
			ownerId: 0,
			description: null,
			priceInMinorUnits: 0,
			customVat: 20,
			deletedAt: null,
		},
	],
	businessName: "Jolene's Sushi Bar",
	returnType: 'orderMade',
}

describe('mapItemsToOrder returning orderMade', () => {
	const mappedOrder = mapItemsToOrder({ ...validInput, returnType: 'orderMade' })

	test('Has orderMade property', async () => {
		expect(mappedOrder).toHaveProperty('orderMade')
	})

	test('Has one product', () => {
		expect(mappedOrder.orderMade?.products.length).toBe(1)
	})

	test('Quantity has been mapped to product details', () => {
		expect(mappedOrder.orderMade?.products[0]).toMatchObject({
			id: 99,
			name: 'Sushi',
			description: null,
			quantity: 4,
			priceInMinorUnitsWithoutVat: 199,
			vat: 20,
		})
	})

	test('Has a customer note', () => {
		expect(mappedOrder.orderMade?.customerNote).toEqual('Oi Jolene, give me my damn sushi!')
	})

	test('Does not have an admin-only note', () => {
		// Strange syntax but appeases the TypeScript compiler
		expect((mappedOrder.orderMade as OrderReceived).adminOnlyNote).toBeUndefined()
	})
})

describe('mapItemsToOrder returning orderReceived', () => {
	const mappedOrder = mapItemsToOrder({ ...validInput, returnType: 'orderReceived' })

	test('Has orderReceived property', async () => {
		expect(mappedOrder).toHaveProperty('orderReceived')
	})

	test('Has one product', () => {
		expect(mappedOrder.orderReceived?.products.length).toBe(1)
	})

	test('Quantity has been mapped to product details', () => {
		expect(mappedOrder.orderReceived?.products[0]).toMatchObject({
			id: 99,
			name: 'Sushi',
			description: null,
			quantity: 4,
			priceInMinorUnitsWithoutVat: 199,
			vat: 20,
		})
	})

	test('Has a customer note', () => {
		expect(mappedOrder.orderReceived?.customerNote).toEqual('Oi Jolene, give me my damn sushi!')
	})

	test('Has an admin-only note', () => {
		// Strange syntax but appeases the TypeScript compiler
		expect(mappedOrder.orderReceived?.adminOnlyNote).toBe('Samantha is such an awful customer!')
	})
})

/* 
pnpm vitest src/library/utilities/public/definitions/mapOrders
*/
