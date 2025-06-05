import type { FormattedDate, FormattedOrder, FormattedProduct, OrderMade, OrderReceived, OrderType } from '@/types'
import type { UiContextData } from '@/types/definitions/contexts/ui'
import { format } from 'date-fns'
import { calculateOrderTotal } from './calculateOrderTotal'
import { formatPrice } from './formatPrice'
import { itemVAT } from './itemVat'
import { relativeDateLabel } from './relativeDateLabel'

export type FormatOrderInput =
	| {
			type: Extract<OrderType, 'orderMade'>
			order: OrderMade
			merchantName: string
			currency: UiContextData['currency']
	  }
	| {
			type: Extract<OrderType, 'orderReceived'>
			order: OrderReceived
			customerName: string
			currency: UiContextData['currency']
	  }

export function formatOrder(input: FormatOrderInput): FormattedOrder {
	const { order, currency } = input

	const { totalWithVAT, totalWithoutVAT, vatOnly } = calculateOrderTotal(order.products)

	const formattedProducts: FormattedProduct[] = order.products.map(({ id, name, quantity, vat, priceInMinorUnitsWithoutVat }) => {
		const { itemVatOnly, itemWithVat } = itemVAT(priceInMinorUnitsWithoutVat, vat)

		return {
			id,
			name,
			quantity,
			itemPrice: formatPrice(priceInMinorUnitsWithoutVat, currency),
			vatPercentage: `${String(vat)}% VAT`,
			subTotalVatOnly: formatPrice(itemVatOnly, currency),
			subtotalWithoutVat: formatPrice(priceInMinorUnitsWithoutVat * quantity, currency),
			subtotalWithVat: formatPrice(itemWithVat * quantity, currency),
		}
	})

	function renderDateLabels(date: Date): FormattedDate {
		return {
			raw: date,
			formatted: format(date, 'EEEE, d MMMM'),
			relativeLabel: relativeDateLabel(date),
		}
	}

	return {
		idNumber: order.id,
		idString: `Order #${order.id}`,

		statusName: order.statusName,

		merchantName: input.type === 'orderMade' ? input.merchantName : order.businessName,
		customerName: input.type === 'orderMade' ? order.businessName : input.customerName,

		noVatOnOrder: vatOnly === 0,
		vatOnly: formatPrice(vatOnly, currency),
		totalWithVAT: formatPrice(totalWithVAT, currency),
		totalWithoutVAT: formatPrice(totalWithoutVAT, currency),

		requestedDeliveryDate: renderDateLabels(order.requestedDeliveryDate),
		createdAt: renderDateLabels(order.createdAt),
		updatedAt: order.updatedAt ? renderDateLabels(order.updatedAt) : undefined,

		products: formattedProducts,

		customerNote: order.customerNote,
		adminOnlyNote: input.type === 'orderReceived' ? input.order.adminOnlyNote : undefined,
	}
}
