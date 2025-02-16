export interface Item {
	displayName: string
	priceInPence: number
}

export interface OrderItem {
	itemDetails: Item
	quantity: number
}
