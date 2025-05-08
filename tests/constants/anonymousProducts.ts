import type { AnonymousProduct } from '@/types'

export const strawberryJam: AnonymousProduct = {
	name: 'Strawberry jam',
	description: 'A delicious homemade conserve made',
	priceInMinorUnits: 213,
	customVat: 15,
}

export const gingerBeer: AnonymousProduct = {
	id: 1,
	name: 'Ginger beer',
	description: 'A spicy fizzy drink',
	priceInMinorUnits: 86,
	customVat: 20,
	deletedAt: null,
}
