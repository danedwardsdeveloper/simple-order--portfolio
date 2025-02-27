import { basicMessages, httpStatus } from '@/library/constants'
import { temporaryVat } from '@/library/constants/definitions/vat'
import { checkUserExists } from '@/library/database/checkRelationship'
import { database } from '@/library/database/connection'
import { orderItems, orders, products } from '@/library/database/schema'
import logger from '@/library/logger'
import { extractIdFromRequestCookie } from '@/library/utilities/server'
import type { AuthenticationMessages, BasicMessages, Order, OrderItem, OrderItemInsertValues, Product, TokenMessages } from '@/types'
import { eq } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'

export interface OrdersOrderIdPOSTresponse {
	message:
		| typeof basicMessages.success
		| typeof basicMessages.serverError
		| TokenMessages
		| 'orderId missing'
		| 'productId missing'
		| 'quantity missing'
		| 'not your order to edit'
	createdOrderItem?: OrderItem
}

export interface OrdersOrderIdPOSTbody {
	orderId: number
	productId: number
	quantity: number
}

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ orderId: number }> },
): Promise<NextResponse<OrdersOrderIdPOSTresponse>> {
	try {
		const orderId = (await params).orderId

		if (!orderId) {
			return NextResponse.json({ message: 'orderId missing' }, { status: httpStatus.http400badRequest })
		}

		const { productId, quantity }: OrdersOrderIdPOSTbody = await request.json()

		if (!productId) {
			return NextResponse.json({ message: 'productId missing' }, { status: httpStatus.http400badRequest })
		}

		if (!quantity) {
			return NextResponse.json({ message: 'quantity missing' }, { status: httpStatus.http400badRequest })
		}

		const { extractedUserId, status, message } = await extractIdFromRequestCookie(request)

		if (!extractedUserId) {
			return NextResponse.json({ message }, { status })
		}

		const { userExists, existingDangerousUser } = await checkUserExists(extractedUserId)

		if (!userExists || !existingDangerousUser) {
			return NextResponse.json({ message: 'user not found' }, { status: httpStatus.http404notFound })
		}

		const [orderToUpdate]: Order[] = await database.select().from(orders).where(eq(orders.customerId, extractedUserId))

		logger.debug('Order to update: ', orderToUpdate)

		const orderMatchesProvidedDetails = orderToUpdate.customerId === extractedUserId

		if (!orderMatchesProvidedDetails) {
			return NextResponse.json({ message: 'not your order to edit' }, { status: httpStatus.http403forbidden })
		}

		// Check order exists and is in a modifiable state (e.g., not completed)

		// Validate basic item input (productId, quantity)

		const [product]: Product[] = await database.select().from(products).where(eq(products.id, productId)).limit(1)

		// Ensure product belongs to a merchant with a relationship

		let vat = 0
		if (!product.customVat) {
			// ToDo: Add default VAT settings
			vat = temporaryVat
		} else {
			vat = product.customVat
		}

		const orderItemInsertValues: OrderItemInsertValues = {
			orderId,
			productId,
			quantity,
			priceInMinorUnitsWithoutVat: product.priceInMinorUnits,
			vat,
			subtotal: product.priceInMinorUnits * (1 + vat / 100),
		}

		const [createdOrderItem]: OrderItem[] = await database.insert(orderItems).values(orderItemInsertValues).returning()

		// Insert item with calculated subtotal

		// Optimisations for later
		// Check if product belongs to correct merchant
		// Validate product is in stock
		// Check if item already exists in order (maybe merge quantities?)
		// Bulk insert support
		// Price override validation/logging
		// Input sanitisation for quantities (max limits etc)
		// Return updated order total

		return NextResponse.json({ message: basicMessages.success, createdOrderItem }, { status: httpStatus.http200ok })
	} catch (error) {
		logger.error(error)
		return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
	}
}

export interface OrdersOrderIdGETresponse {
	message: BasicMessages | AuthenticationMessages | 'orderId missing'
	items?: OrderItem[]
}

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ orderId: number }> },
): Promise<NextResponse<OrdersOrderIdGETresponse>> {
	try {
		logger.debug('Params: ', params)
		const orderId = (await params).orderId

		if (!orderId) {
			return NextResponse.json({ message: 'orderId missing' }, { status: httpStatus.http400badRequest })
		}

		// ToDo: check the order belongs to the person requesting it

		const items = await database.select().from(orderItems).where(eq(orderItems.orderId, orderId))

		// ToDo: transform the data

		return NextResponse.json({ message: basicMessages.success, items }, { status: httpStatus.http200ok })
	} catch (error) {
		logger.error(error)
		return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
	}
}
