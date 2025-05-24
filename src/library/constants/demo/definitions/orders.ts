import type { OrderMade, OrderReceived } from '@/types'
import { demoInventory } from './inventory'
import { demoCustomer, demoMerchant } from './users'

export const demoOrdersMade: OrderMade[] = [
	{
		id: 1,
		statusName: 'Pending',
		businessName: demoMerchant.businessName,
		requestedDeliveryDate: new Date(),
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
		createdAt: new Date(),
		updatedAt: new Date(),
	},
]

const customerNotes: OrderReceived['customerNote'][] = [
	'Hi Jane, we have a photographer coming tomorrow. Please could you give us your prettiest loaves? Many thanks, Antonio',
]

export const demoOrdersReceived: OrderReceived[] = demoOrdersMade.map((order, index) => ({
	...order,
	businessName: demoCustomer.businessName,
	customerNote: customerNotes[index],
}))
