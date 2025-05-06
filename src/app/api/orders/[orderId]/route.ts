import { orderIsCompleted, serviceConstraints, userMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkAccess } from '@/library/database/operations'
import { orderItems, orders } from '@/library/database/schema'
import { containsIllegalCharacters, isSelectedProductArray, isValidDate } from '@/library/utilities/public'
import { initialiseResponder } from '@/library/utilities/server'
import { equals } from '@/library/utilities/server'
import type { BaseOrder, SelectedProduct } from '@/types'
import type { NextRequest, NextResponse } from 'next/server'

export interface OrdersOrderIdPATCHresponse {
	userMessage?: typeof userMessages.serverError
	developmentMessage?: string
	// updatedOrder?: OrderItem // ToDo: getOrder details
}

// Should accept details for multiple items
// requestedDeliveryDate etc.
export interface OrdersOrderIdPATCHbody {
	customerNote?: string
	requestedDeliveryDate?: Date
	orderItemsToUpdate?: SelectedProduct[]
}

export type OrdersOrderIdPATCHparams = Promise<{
	orderId: string
}>

type Output = Promise<NextResponse<OrdersOrderIdPATCHresponse>>

export async function PATCH(request: NextRequest, { params }: { params: OrdersOrderIdPATCHparams }): Output {
	const respond = initialiseResponder<OrdersOrderIdPATCHresponse>()
	try {
		const orderId = Number((await params).orderId)

		if (!orderId) {
			return respond({
				status: 400,
				developmentMessage: 'orderId missing',
			})
		}

		const { requestedDeliveryDate, customerNote, orderItemsToUpdate }: OrdersOrderIdPATCHbody = await request.json()

		if (!requestedDeliveryDate && !customerNote && !orderItemsToUpdate) {
			return respond({
				status: 400,
				developmentMessage: 'At least one property to update must be provided',
			})
		}

		// Use Zod
		if (customerNote) {
			if (containsIllegalCharacters(customerNote)) {
				return respond({
					status: 400,
					developmentMessage: 'customerNote contains illegal characters',
				})
			}
			if (customerNote.length > serviceConstraints.maximumCustomerNoteLength) {
				return respond({
					status: 400,
					developmentMessage: `customerNote is too long: ${customerNote.length} characters. Maximum: ${serviceConstraints.maximumCustomerNoteLength}`,
				})
			}
		}

		// Validate the requestedDeliveryDate, if provided
		if (requestedDeliveryDate) {
			if (!isValidDate(new Date(requestedDeliveryDate))) {
				return respond({
					status: 400,
					developmentMessage: `requestedDeliveryDate invalid: ${requestedDeliveryDate}`,
				})
			}
		}

		// Validate orderItemsToUpdate
		if (orderItemsToUpdate && !isSelectedProductArray(orderItemsToUpdate)) {
			return respond({
				status: 400,
				developmentMessage: 'orderItemsToUpdate is in the wrong format',
			})
		}

		const { dangerousUser, accessDenied } = await checkAccess({
			request,
			requireConfirmed: true,
			requireSubscriptionOrTrial: false, // Free for customers
		})

		if (accessDenied) {
			return respond({
				status: accessDenied.status,
				developmentMessage: accessDenied.message,
			})
		}

		const [orderToUpdate]: BaseOrder[] = await database.select().from(orders).where(equals(orders.id, orderId))

		if (!orderToUpdate) {
			return respond({
				status: 400,
				developmentMessage: `Couldn't find order with ID ${orderId}`,
			})
		}

		if (orderToUpdate.customerId !== dangerousUser.id) {
			return respond({
				status: 403,
				developmentMessage: `Order with ID ${orderId} was not created by ${dangerousUser.businessName}`,
			})
		}

		// Check order is not completed
		if (orderIsCompleted(orderToUpdate.statusId)) {
			return respond({
				status: 403,
				developmentMessage: `Can't update order with ID ${orderId} because it's marked as completed`,
			})
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
				return respond({
					status: 400,
					developmentMessage: 'orderItemsToUpdate is in the wrong format',
				})
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
			return respond({
				status: 400,
				developmentMessage: 'no data to change',
			})
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

		return respond({
			status: 200,
			developmentMessage: 'Success',
		})
	} catch (caughtError) {
		return respond({
			body: { userMessage: userMessages.serverError },
			status: 500,
			caughtError,
		})
	}
}
