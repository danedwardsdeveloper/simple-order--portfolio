import type { Item } from '@/types'

export const bakeryItems: { [key: string]: Item } = {
	croissant: {
		displayName: 'Croissant',
		priceInPence: 94,
	},
	sourdough: {
		displayName: 'Sourdough Loaf',
		priceInPence: 185,
	},
	baguette: {
		displayName: 'Baguette',
		priceInPence: 115,
	},
	cinnamonRoll: {
		displayName: 'Cinnamon Roll',
		priceInPence: 125,
	},
	painAuChocolat: {
		displayName: 'Pain au Chocolat',
		priceInPence: 108,
	},
	muffin: {
		displayName: 'Blueberry Muffin',
		priceInPence: 75,
	},
	focaccia: {
		displayName: 'Focaccia',
		priceInPence: 165,
	},
	scone: {
		displayName: 'Plain Scone',
		priceInPence: 68,
	},
	brioche: {
		displayName: 'Brioche Loaf',
		priceInPence: 195,
	},
	danish: {
		displayName: 'Danish Pastry',
		priceInPence: 89,
	},
}
