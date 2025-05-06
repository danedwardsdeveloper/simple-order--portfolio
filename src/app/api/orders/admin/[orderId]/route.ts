import { orderStatusIdToName, serviceConstraints, userMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkAccess } from '@/library/database/operations'
import { orders } from '@/library/database/schema'
import { containsIllegalCharacters } from '@/library/utilities/public'
import { equals, initialiseResponder } from '@/library/utilities/server'
import type { BaseOrder, OrderStatusId, OrderStatusName } from '@/types'
import type { NextRequest, NextResponse } from 'next/server'

export interface OrderAdminOrderIdPATCHresponse {
	developmentMessage?: string
	userMessage?: typeof userMessages.serverError
	updatedOrder?: {
		id: number
		statusName?: OrderStatusName
		adminOnlyNote?: string
	}
}

export type OrderAdminOrderIdPATCHbody = Pick<BaseOrder, 'id'> & Partial<Pick<BaseOrder, 'adminOnlyNote' | 'statusId'>>

export interface OrderAdminOrderIdPATCHparams {
	orderId: string // Next.js params are always strings
}

type OutputPATCH = Promise<NextResponse<OrderAdminOrderIdPATCHresponse>>

// Allows a merchant to change the status or note on an order they've received
export async function PATCH(request: NextRequest, { params }: { params: Promise<OrderAdminOrderIdPATCHparams> }): OutputPATCH {
	const respond = initialiseResponder<OrderAdminOrderIdPATCHresponse>()

	try {
		const orderId = Number((await params).orderId)
		const { adminOnlyNote, statusId }: OrderAdminOrderIdPATCHbody = await request.json()

		if (!orderId) {
			return respond({
				status: 400,
				developmentMessage: 'orderId missing',
			})
		}

		// Check at least one property to update has been provided
		if (!statusId && !adminOnlyNote) {
			return respond({
				status: 400,
				developmentMessage: 'neither statusId nor adminOnlyNote provided. At least one property to update must be provided',
			})
		}

		if (!Number.isFinite(orderId)) {
			return respond({
				status: 400,
				developmentMessage: `orderId not a valid number: ${orderId}`,
			})
		}

		// Validate statusId, if provided
		if (statusId !== 1 && statusId !== 2 && statusId !== 3) {
			return respond({
				status: 400,
				developmentMessage: `statusId invalid: ${statusId}`,
			})
		}

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

		if (statusId && foundOrder.statusId !== statusId) hasChanges = true

		if (!hasChanges) {
			return respond({
				status: 400,
				developmentMessage: 'Nothing to update',
			})
		}

		// Update the order
		// ToDo: I think this will wipe the field that isn't being updated...
		const [updatedOrder] = await database.update(orders).set({ adminOnlyNote, statusId }).where(equals(orders.id, orderId)).returning({
			id: orders.id,
			adminOnlyNote: orders.adminOnlyNote,
			statusId: orders.statusId,
		})

		if (!updatedOrder) {
			return respond({
				status: 503,
				developmentMessage: 'Failed to update order',
			})
		}

		return respond({
			body: {
				updatedOrder: {
					id: orderId,
					adminOnlyNote: updatedOrder.adminOnlyNote || undefined,
					statusName: orderStatusIdToName[updatedOrder.statusId as OrderStatusId] || undefined,
				},
			},
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
