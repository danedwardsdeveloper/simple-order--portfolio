import type { OrderMade, OrderReceived } from '@/types'
import { demoInventory } from './inventory'
import { demoCustomer, demoMerchant } from './users'

// Don't use utilities in /constants
const now = new Date()
const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
export const orderIdStartNumber = 484

export const demoOrdersMade: OrderMade[] = [
	{
		id: orderIdStartNumber,
		statusName: 'Pending',
		businessName: demoMerchant.businessName,
		requestedDeliveryDate: twoDaysFromNow,
		customerNote: 'Hi Jane, we have a photographer coming tomorrow. Please could you give us your prettiest loaves? Many thanks, Antonio',
		products: [
			{
				id: demoInventory[0].id,
				quantity: 2,
				priceInMinorUnitsWithoutVat: demoInventory[0].priceInMinorUnits,
				vat: demoInventory[0].customVat,
				name: demoInventory[0].name,
				description: demoInventory[0].description,
			},
			{
				id: demoInventory[1].id,
				quantity: 4,
				priceInMinorUnitsWithoutVat: demoInventory[1].priceInMinorUnits,
				vat: demoInventory[1].customVat,
				name: demoInventory[1].name,
				description: demoInventory[1].description,
			},
		],
		createdAt: threeDaysAgo,
	},
	{
		id: orderIdStartNumber + 1,
		statusName: 'Completed',
		businessName: demoMerchant.businessName,
		requestedDeliveryDate: twoDaysFromNow,
		products: [
			{
				id: demoInventory[4].id,
				quantity: 2,
				priceInMinorUnitsWithoutVat: demoInventory[4].priceInMinorUnits,
				vat: demoInventory[4].customVat,
				name: demoInventory[4].name,
				description: demoInventory[4].description,
			},
			{
				id: demoInventory[10].id,
				quantity: 4,
				priceInMinorUnitsWithoutVat: demoInventory[10].priceInMinorUnits,
				vat: demoInventory[10].customVat,
				name: demoInventory[10].name,
				description: demoInventory[10].description,
			},
		],
		createdAt: threeDaysAgo,
	},
]

export const demoOrdersReceived: OrderReceived[] = demoOrdersMade.map((order) => ({
	...order,
	businessName: demoCustomer.businessName,
}))
