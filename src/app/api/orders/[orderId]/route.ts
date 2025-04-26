import { type basicMessages, orderStatus, serviceConstraints, userMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkUserExists } from '@/library/database/operations'
import { orderItems, orders } from '@/library/database/schema'
import {
	containsIllegalCharacters,
	isSelectedProductArray,
	isValidDate,
	logAndSanitiseApiError,
	logAndSanitiseApiResponse,
} from '@/library/utilities/public'
import { extractIdFromRequestCookie } from '@/library/utilities/server'
import { equals } from '@/library/utilities/server'
import type { BaseOrder, SelectedProduct, TokenMessages } from '@/types'
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

const routeDetail = 'PATCH /api/orders/[orderId]:'

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
		if (customerNote) {
			if (containsIllegalCharacters(customerNote)) {
				const developerMessage = logAndSanitiseApiResponse({
					routeDetail,
					message: 'customerNote contains illegal characters',
				})
				return NextResponse.json({ developerMessage }, { status: 400 })
			}
			if (customerNote.length > serviceConstraints.maximumCustomerNoteLength) {
				const developerMessage = logAndSanitiseApiResponse({
					routeDetail,
					message: `customerNote is too long: ${customerNote.length} characters. Maximum: ${serviceConstraints.maximumCustomerNoteLength}`,
				})
				return NextResponse.json({ developerMessage }, { status: 400 })
			}
		}

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

		const [orderToUpdate]: BaseOrder[] = await database.select().from(orders).where(equals(orders.id, orderId))

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

		// Optimisation ToDo: Check cut-off time has not been exceeded

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

		const orderItemsUpdateData: Pick<OrdersOrderIdPATCHbody, 'orderItemsToUpdate'> = {}

		const foundOrderItems = await database.select().from(orderItems).where(equals(orderItems.orderId, orderId))

		// Check order items are different
		let hasOrderItemChanges = false

		if (orderItemsToUpdate) {
			if (!isSelectedProductArray(orderItemsToUpdate)) {
				const developerMessage = logAndSanitiseApiResponse({
					routeDetail,
					message: 'orderItemsToUpdate is in the wrong format',
				})
				return NextResponse.json({ developerMessage }, { status: 400 })
			}

			// Check if quantities have changed

			const orderItemUpdates = []

			// Map existing items to make lookup easier
			const existingOrderItems: Record<number, (typeof foundOrderItems)[0]> = {}
			for (const item of foundOrderItems) {
				existingOrderItems[item.productId] = item
			}

			// Compare new quantities with existing quantities
			for (const updateItem of orderItemsToUpdate) {
				const existingItem = existingOrderItems[updateItem.productId]

				if (existingItem) {
					// Check if quantity changed
					if (existingItem.quantity !== updateItem.quantity) {
						hasOrderItemChanges = true
						orderItemUpdates.push({
							id: existingItem.id,
							productId: updateItem.productId,
							quantity: updateItem.quantity,
						})
					}
				} else {
					// New item (product not in existing order)
					hasOrderItemChanges = true
					orderItemUpdates.push({
						orderId,
						productId: updateItem.productId,
						quantity: updateItem.quantity,
					})
				}
			}

			if (hasOrderItemChanges) {
				orderItemsUpdateData.orderItemsToUpdate = orderItemUpdates
			}
		}

		if (Object.keys(orderUpdateData).length === 0 && !orderItemsUpdateData.orderItemsToUpdate?.length) {
			const developerMessage = logAndSanitiseApiResponse({
				routeDetail,
				level: 'level2warn',
				message: 'no data to change',
			})
			return NextResponse.json({ developerMessage }, { status: 400 })
		}

		// ToDo: add transaction

		// Update the order, if necessary
		if (Object.keys(orderUpdateData).length > 0) {
			await database.update(orders).set(orderUpdateData).where(equals(orders.id, orderId)).returning()
		}

		// Update the order items, if necessary
		if (orderItemsUpdateData.orderItemsToUpdate?.length) {
			for (const item of orderItemsUpdateData.orderItemsToUpdate) {
				if (item.productId) {
					// Update existing item
					await database.update(orderItems).set({ quantity: item.quantity }).where(equals(orderItems.productId, item.productId))
				} else {
					// Insert any additional items
					await database.insert(orderItems).values({
						orderId,
						productId: item.productId,
						quantity: item.quantity,
						priceInMinorUnitsWithoutVat: 0, // ToDo: Get the price from somewhere...
						vat: 0, // ToDo: Get the VAT from somewhere...
					})
				}
			}
		}

		return NextResponse.json({ developerMessage: 'success' }, { status: 200 })
	} catch (error) {
		const developmentError = logAndSanitiseApiError({
			routeDetail,
			error,
		})
		return NextResponse.json({ userMessage: userMessages.serverError, developmentError }, { status: 500 })
	}
}
