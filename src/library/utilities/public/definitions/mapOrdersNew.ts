import { orderStatusIdToName } from '@/library/constants'
import type {
	BaseOrder,
	BrowserOrderItem,
	DangerousBaseUser,
	NonEmptyArray,
	OrderItem,
	OrderMade,
	OrderReceived,
	OrderStatusId,
	Product,
} from '@/types'
import { emptyToNull } from './arrays'

interface MapOrdersNewProps {
	dangerousUser: DangerousBaseUser
	profiles: NonEmptyArray<DangerousBaseUser> | null
	orderRows: NonEmptyArray<BaseOrder> | null
	orderItems: NonEmptyArray<OrderItem> | null
	products: NonEmptyArray<Product> | null
}

export function mapOrdersNew(props: MapOrdersNewProps): {
	ordersMade: NonEmptyArray<OrderMade> | null
	ordersReceived: NonEmptyArray<OrderReceived> | null
} {
	if (!props.orderRows || !props.orderItems || !props.products || !props.profiles) {
		return { ordersMade: null, ordersReceived: null }
	}

	const profilesMap = new Map(props.profiles.map((profile) => [profile.id, profile]))
	const itemsByOrder = new Map<number, OrderItem[]>()

	for (const item of props.orderItems) {
		const existingItems = itemsByOrder.get(item.orderId)
		if (existingItems) {
			existingItems.push(item)
		} else {
			itemsByOrder.set(item.orderId, [item])
		}
	}

	const ordersMade: OrderMade[] = []
	const ordersReceived: OrderReceived[] = []

	for (const order of props.orderRows) {
		const items = itemsByOrder.get(order.id) || []

		if (order.customerId === props.dangerousUser.id) {
			const merchant = profilesMap.get(order.merchantId)
			if (merchant) {
				ordersMade.push(createOrderMade(order, items, props.products, merchant.businessName))
			}
		}

		if (order.merchantId === props.dangerousUser.id) {
			const customer = profilesMap.get(order.customerId)
			if (customer) {
				ordersReceived.push(createOrderReceived(order, items, props.products, customer.businessName))
			}
		}
	}

	return {
		ordersMade: emptyToNull(ordersMade),
		ordersReceived: emptyToNull(ordersReceived),
	}
}

function createOrderMade(order: BaseOrder, items: OrderItem[], products: Product[], businessName: string): OrderMade {
	const mappedProducts = mapOrderItems(items, products)

	return {
		id: order.id,
		statusName: orderStatusIdToName[order.statusId as OrderStatusId],
		businessName,
		customerNote: order.customerNote || undefined,
		requestedDeliveryDate: order.requestedDeliveryDate,
		createdAt: order.createdAt,
		updatedAt: order.updatedAt,
		products: mappedProducts,
	}
}

function createOrderReceived(order: BaseOrder, items: OrderItem[], products: Product[], businessName: string): OrderReceived {
	const mappedProducts = mapOrderItems(items, products)

	return {
		id: order.id,
		statusName: orderStatusIdToName[order.statusId as OrderStatusId],
		businessName,
		adminOnlyNote: order.adminOnlyNote || undefined,
		customerNote: order.customerNote || undefined,
		requestedDeliveryDate: order.requestedDeliveryDate,
		createdAt: order.createdAt,
		updatedAt: order.updatedAt,
		products: mappedProducts,
	}
}

function mapOrderItems(items: OrderItem[], products: Product[]): BrowserOrderItem[] {
	return items
		.map((item) => {
			const product = products.find((p) => p.id === item.productId)
			if (!product) return null

			return {
				id: item.productId,
				name: product.name,
				description: product.description,
				quantity: item.quantity,
				priceInMinorUnitsWithoutVat: item.priceInMinorUnitsWithoutVat,
				vat: item.vat,
			} satisfies BrowserOrderItem
		})
		.filter((item): item is BrowserOrderItem => item !== null)
}
