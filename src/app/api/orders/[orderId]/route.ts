import { apiPaths, type basicMessages, orderStatus, userMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkUserExists } from '@/library/database/operations'
import { orderItems, orders } from '@/library/database/schema'
import logger from '@/library/logger'
import { isSelectedProductArray, isValidDate, logAndSanitiseApiResponse } from '@/library/utilities'
import { extractIdFromRequestCookie } from '@/library/utilities/server'
import type { BaseOrder, SelectedProduct, TokenMessages } from '@/types'
import { eq } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'

export interface OrdersOrderIdPATCHresponse {
	userMessage?:
		| typeof basicMessages.success
		| typeof userMessages.serverError
		| TokenMessages
		| 'orderId missing'
		| 'productId missing'
		| 'quantity missing'
		| 'not your order to edit'
	developerMessage?: string
	// updatedOrder?: OrderItem // ToDo: getOrder details
}

// Should accept details for multiple items
// requestedDeliveryDate etc.
export interface OrdersOrderIdPATCHbody {
	customerNote?: string
	requestedDeliveryDate?: Date
	orderItemsToUpdate?: SelectedProduct[]
}

export interface OrdersOrderIdPATCHparams {
	orderId: string
}

const routeDetail = `PATCH ${apiPaths.orders.customerPerspective.orderId}:`

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<OrdersOrderIdPATCHparams> },
): Promise<NextResponse<OrdersOrderIdPATCHresponse>> {
	try {
		const unwrappedParams = await params
		const orderId = Number(unwrappedParams.orderId)

		// Check the orderId exists
		if (!orderId) {
			const developerMessage = logAndSanitiseApiResponse({
				message: 'orderId missing',
				routeDetail,
			})
			return NextResponse.json({ developerMessage }, { status: 400 })
		}

		const { requestedDeliveryDate, customerNote, orderItemsToUpdate }: OrdersOrderIdPATCHbody = await request.json()

		// Check at least one property to update has been provided
		if (!requestedDeliveryDate && !customerNote && !orderItemsToUpdate) {
			const developerMessage = logAndSanitiseApiResponse({
				routeDetail,
				message: 'At least one property to update must be provided',
			})
			return NextResponse.json({ developerMessage }, { status: 400 })
		}

		// Validate customerNote
		// - containsIllegalCharacters
		// - not too long

		// Validate the requestedDeliveryDate, if provided
		if (requestedDeliveryDate) {
			if (!isValidDate(new Date(requestedDeliveryDate))) {
				const developerMessage = logAndSanitiseApiResponse({
					routeDetail,
					message: `requestedDeliveryDate invalid: ${requestedDeliveryDate}`,
				})
				return NextResponse.json({ developerMessage }, { status: 400 })
			}
		}

		// Validate orderItemsToUpdate
		if (orderItemsToUpdate) {
			if (!isSelectedProductArray(orderItemsToUpdate)) {
				const developerMessage = logAndSanitiseApiResponse({
					routeDetail,
					message: 'orderItemsToUpdate is in the wrong format',
				})
				return NextResponse.json({ developerMessage }, { status: 400 })
			}
		}

		// Validate the user
		const { extractedUserId, status, message: developerMessage } = await extractIdFromRequestCookie(request)

		if (!extractedUserId) {
			return NextResponse.json({ developerMessage }, { status })
		}

		const { userExists, existingDangerousUser } = await checkUserExists(extractedUserId)

		if (!userExists || !existingDangerousUser) {
			return NextResponse.json({ developerMessage: 'user not found' }, { status: 404 })
		}

		const [orderToUpdate]: BaseOrder[] = await database.select().from(orders).where(eq(orders.id, orderId))

		if (!orderToUpdate) {
			const developerMessage = logAndSanitiseApiResponse({
				routeDetail,
				message: `Couldn't find order with ID ${orderId}`,
			})
			return NextResponse.json({ developerMessage }, { status: 400 })
		}

		if (orderToUpdate.customerId !== extractedUserId) {
			const developerMessage = logAndSanitiseApiResponse({
				routeDetail,
				message: `Order with ID ${orderId} was not created by ${existingDangerousUser.businessName}`,
			})
			return NextResponse.json({ developerMessage }, { status: 403 })
		}

		// Check order is not completed
		if (orderToUpdate.status === orderStatus.completed) {
			const developerMessage = logAndSanitiseApiResponse({
				routeDetail,
				message: `Can't update order with ID ${orderId} because it is ${orderToUpdate.status}`,
			})
			return NextResponse.json({ developerMessage }, { status: 403 })
		}

		// Check cut-off date has not been exceeded

		// Prepare the update data
		const orderUpdateData: Pick<OrdersOrderIdPATCHbody, 'customerNote' | 'requestedDeliveryDate'> = {}

		// Check the customerNote is different
		if (customerNote) {
			if (customerNote !== orderToUpdate.customerNote) {
				orderUpdateData.customerNote = customerNote
			}
		}

		// Check the requestedDeliveryDate is different
		if (requestedDeliveryDate) {
			const newDate = new Date(requestedDeliveryDate)
			const existingDate = new Date(orderToUpdate.requestedDeliveryDate)

			if (newDate.getTime() !== existingDate.getTime()) {
				orderUpdateData.requestedDeliveryDate = newDate
			}
		}

		// Primary ToDo: work on this route

		const orderItemsUpdateData: Pick<OrdersOrderIdPATCHbody, 'orderItemsToUpdate'> = {}

		const foundOrderItems = await database.select().from(orderItems).where(eq(orderItems.orderId, orderId))

		// foundOrderItems[0].quantity
		// foundOrderItems[0].productId

		// Check order items are different
		if (orderItemsToUpdate) {
			if (!isSelectedProductArray(orderItemsToUpdate)) {
			}
			orderItemsUpdateData.orderItemsToUpdate = orderItemsToUpdate
		}

		if (Object.keys(orderUpdateData).length === 0) {
			const developerMessage = logAndSanitiseApiResponse({
				routeDetail,
				message: 'no data to change',
			})
			return NextResponse.json({ developerMessage }, { status: 400 })
		}

		// Transaction

		// - update order
		// - update order items, if necessary

		await database.update(orders).set(orderUpdateData).where(eq(orders.id, orderId)).returning()

		// Important ToDo: Update order items if needed

		return NextResponse.json({ developerMessage: 'success' }, { status: 200 })
	} catch (error) {
		logger.error(error)
		return NextResponse.json({ userMessage: userMessages.databaseError }, { status: 500 })
	}
}
