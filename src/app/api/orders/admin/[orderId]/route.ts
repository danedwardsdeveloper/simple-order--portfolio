import { serviceConstraints, userMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkActiveSubscriptionOrTrial, checkUserExists } from '@/library/database/operations'
import { orders } from '@/library/database/schema'
import { containsIllegalCharacters, initialiseDevelopmentLogger, isOrderStatus } from '@/library/utilities/public'
import { extractIdFromRequestCookie } from '@/library/utilities/server'
import { equals } from '@/library/utilities/server'
import type { BaseOrder } from '@/types'
import { type NextRequest, NextResponse } from 'next/server'

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
export type OrderAdminOrderIdPATCHbody = Partial<Pick<BaseOrder, 'adminOnlyNote' | 'status'>>

export interface OrderAdminOrderIdPATCHparams {
	orderId: string // Next.js params are always strings
}

// Allows a merchant to change the status or note on an order they've received
export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<OrderAdminOrderIdPATCHparams> },
): Promise<NextResponse<OrderAdminOrderIdPATCHresponse>> {
	const developmentLogger = initialiseDevelopmentLogger('PATCH api/orders/admin/[orderId]: ')
	try {
		const orderId = Number((await params).orderId)
		const { adminOnlyNote, status: orderStatus }: OrderAdminOrderIdPATCHbody = await request.json()

		if (!orderId) {
			const developmentMessage = developmentLogger('orderId missing')
			return NextResponse.json({ developmentMessage }, { status: 400 })
		}

		// Check at least one property to update has been provided
		if (!orderStatus && !adminOnlyNote) {
			const developmentMessage = developmentLogger(
				'neither orderStatus nor adminOnlyNote provided. At least one property to update must be provided',
			)
			return NextResponse.json({ developmentMessage }, { status: 400 })
		}

		if (!Number.isFinite(orderId)) {
			const developmentMessage = developmentLogger(`orderId not a valid number: ${orderId}`)
			return NextResponse.json({ developmentMessage }, { status: 400 })
		}

		// Validate orderStatus, if provided
		if (orderStatus) {
			if (!isOrderStatus(orderStatus)) {
				const developmentMessage = developmentLogger(`orderStatus invalid: ${orderStatus}`)
				return NextResponse.json({ developmentMessage }, { status: 400 })
			}
		}

		// Validate adminOnlyNote, if provided
		if (adminOnlyNote) {
			if (adminOnlyNote.length > serviceConstraints.maximumCustomerNoteLength) {
				const developmentMessage = developmentLogger(`adminOnlyNote too long: ${adminOnlyNote.length} characters`)
				return NextResponse.json({ developmentMessage }, { status: 400 })
			}

			if (containsIllegalCharacters(adminOnlyNote)) {
				const developmentMessage = developmentLogger('adminOnlyNote contains illegal characters')
				return NextResponse.json({ developmentMessage }, { status: 400 })
			}
		}

		// Extract user ID from token
		const { extractedUserId, status, message: cookieMessage } = await extractIdFromRequestCookie(request)

		if (!extractedUserId) {
			const developmentMessage = developmentLogger(cookieMessage)
			return NextResponse.json({ developmentMessage }, { status })
		}

		const { existingDangerousUser } = await checkUserExists(extractedUserId)

		if (!existingDangerousUser) {
			const developmentMessage = developmentLogger('user not found')
			return NextResponse.json({ developmentMessage }, { status: 401 })
		}

		// Check user has valid trial or subscription
		const { activeSubscriptionOrTrial } = await checkActiveSubscriptionOrTrial(extractedUserId, existingDangerousUser?.cachedTrialExpired)

		if (!activeSubscriptionOrTrial) {
			const developmentMessage = developmentLogger('No active trial or subscription')
			return NextResponse.json({ developmentMessage }, { status: 401 })
		}

		const [foundOrder] = await database.select().from(orders).where(equals(orders.id, orderId)).limit(1)

		// Check order exists
		if (!foundOrder) {
			const developmentMessage = developmentLogger(`Order with ID ${orderId} not found`)
			return NextResponse.json({ developmentMessage }, { status: 400 })
		}

		// Check order belongs to user
		if (foundOrder.merchantId !== extractedUserId) {
			const developmentMessage = developmentLogger(
				`Order with ID ${orderId} does not belong to ${existingDangerousUser.businessName} (user ID: ${extractedUserId})`,
			)
			return NextResponse.json({ developmentMessage }, { status: 403 })
		}

		// Check there is actually a difference before updating
		let hasChanges = false

		if (adminOnlyNote && foundOrder.adminOnlyNote !== adminOnlyNote) hasChanges = true

		if (orderStatus && foundOrder.status !== orderStatus) hasChanges = true

		if (!hasChanges) {
			const developmentMessage = developmentLogger('Nothing to update')
			return NextResponse.json({ developmentMessage }, { status: 400 })
		}

		// Update the order
		const [updatedOrder] = await database
			.update(orders)
			.set({ adminOnlyNote, status: orderStatus })
			.where(equals(orders.id, orderId))
			.returning({
				adminOnlyNote: orders.adminOnlyNote,
				status: orders.status,
			})

		if (!updatedOrder) {
			const developmentMessage = developmentLogger('Failed to update order')
			return NextResponse.json({ developmentMessage }, { status: 503 })
		}

		const developmentMessage = developmentLogger('Order updated successfully', { level: 'level3success' })
		return NextResponse.json({ updatedOrder, developmentMessage }, { status: 200 })
	} catch (error) {
		const developmentMessage = developmentLogger('Caught error', { error })
		return NextResponse.json({ userMessage: userMessages.serverError, developmentMessage }, { status: 500 })
	}
}
