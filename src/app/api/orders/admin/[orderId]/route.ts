import { serviceConstraints, userMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkAccess } from '@/library/database/operations'
import { orders } from '@/library/database/schema'
import { containsIllegalCharacters, isOrderStatus } from '@/library/utilities/public'
import { equals, initialiseResponder } from '@/library/utilities/server'
import type { BaseOrder } from '@/types'
import type { NextRequest, NextResponse } from 'next/server'

export interface OrderAdminOrderIdPATCHresponse {
	developmentMessage?: string
	userMessage?: typeof userMessages.serverError
	updatedOrder?: OrderAdminOrderIdPATCHbody
}

/**
 * @example
const body: OrderAdminOrderIdPATCHbody = {
	adminOnlyNote: 'I hate this customer! She kicked my dog!', // optional
	status: 'cancelled', // 'completed' | 'pending' - optional
}
 */
export type OrderAdminOrderIdPATCHbody = Pick<BaseOrder, 'id'> & Partial<Pick<BaseOrder, 'adminOnlyNote' | 'status'>>

export interface OrderAdminOrderIdPATCHparams {
	orderId: string // Next.js params are always strings
}

type OutputPATCH = Promise<NextResponse<OrderAdminOrderIdPATCHresponse>>

// Allows a merchant to change the status or note on an order they've received
export async function PATCH(request: NextRequest, { params }: { params: Promise<OrderAdminOrderIdPATCHparams> }): OutputPATCH {
	const respond = initialiseResponder<OrderAdminOrderIdPATCHresponse>()

	try {
		const orderId = Number((await params).orderId)
		const { adminOnlyNote, status: orderStatus }: OrderAdminOrderIdPATCHbody = await request.json()

		if (!orderId) {
			return respond({
				status: 400,
				developmentMessage: 'orderId missing',
			})
		}

		// Check at least one property to update has been provided
		if (!orderStatus && !adminOnlyNote) {
			return respond({
				status: 400,
				developmentMessage: 'neither orderStatus nor adminOnlyNote provided. At least one property to update must be provided',
			})
		}

		if (!Number.isFinite(orderId)) {
			return respond({
				status: 400,
				developmentMessage: `orderId not a valid number: ${orderId}`,
			})
		}

		// Validate orderStatus, if provided
		if (orderStatus && !isOrderStatus(orderStatus)) {
			return respond({
				status: 400,
				developmentMessage: `orderStatus invalid: ${orderStatus}`,
			})
		}

		// Validate adminOnlyNote, if provided
		if (adminOnlyNote) {
			if (adminOnlyNote.length > serviceConstraints.maximumCustomerNoteLength) {
				return respond({
					status: 400,
					developmentMessage: `adminOnlyNote too long: ${adminOnlyNote.length} characters`,
				})
			}

			if (containsIllegalCharacters(adminOnlyNote)) {
				return respond({
					status: 400,
					developmentMessage: 'adminOnlyNote contains illegal characters',
				})
			}
		}

		const { dangerousUser, accessDenied } = await checkAccess({
			request,
			requireConfirmed: true,
			requireSubscriptionOrTrial: true,
		})

		if (accessDenied) {
			return respond({
				status: accessDenied.status,
				developmentMessage: accessDenied.message,
			})
		}

		const [foundOrder] = await database.select().from(orders).where(equals(orders.id, orderId)).limit(1)

		// Check order exists
		if (!foundOrder) {
			return respond({
				status: 400,
				developmentMessage: `Order with ID ${orderId} not found`,
			})
		}

		// Check order belongs to user
		if (foundOrder.merchantId !== dangerousUser.id) {
			return respond({
				body: {},
				status: 403,
				developmentMessage: `Order with ID ${orderId} does not belong to ${dangerousUser.businessName} (user ID: ${dangerousUser.id})`,
			})
		}

		// Check there is actually a difference before updating
		let hasChanges = false

		if (adminOnlyNote && foundOrder.adminOnlyNote !== adminOnlyNote) hasChanges = true

		if (orderStatus && foundOrder.status !== orderStatus) hasChanges = true

		if (!hasChanges) {
			return respond({
				status: 400,
				developmentMessage: 'Nothing to update',
			})
		}

		// Update the order
		const [updatedOrder] = await database
			.update(orders)
			.set({ adminOnlyNote, status: orderStatus })
			.where(equals(orders.id, orderId))
			.returning({
				id: orders.id,
				adminOnlyNote: orders.adminOnlyNote,
				status: orders.status,
			})

		if (!updatedOrder) {
			return respond({
				status: 503,
				developmentMessage: 'Failed to update order',
			})
		}

		return respond({
			body: { updatedOrder },
			status: 200,
			developmentMessage: 'Order updated successfully',
		})
	} catch (caughtError) {
		return respond({
			body: { userMessage: userMessages.serverError },
			status: 500,
			caughtError,
		})
	}
}
