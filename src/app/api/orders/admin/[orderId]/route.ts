import { apiPaths, authenticationMessages, httpStatus, serviceConstraints, unauthorisedMessages, userMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkActiveSubscriptionOrTrial, checkUserExists } from '@/library/database/operations'
import { orders } from '@/library/database/schema'
import { containsIllegalCharacters, isOrderStatus, logAndSanitiseApiResponse } from '@/library/utilities/public'
import { extractIdFromRequestCookie } from '@/library/utilities/server'
import type { BaseOrder } from '@/types'
import { eq } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'

// Main ToDo: Keep working in this

export interface OrderAdminOrderIdPATCHresponse {
	developerMessage?: string
	userMessage?: typeof userMessages.serverError | 'Order updated successfully' | typeof userMessages.signIn
	updatedOrder?: OrderAdminOrderIdPATCHbody
}

export type OrderAdminOrderIdPATCHbody = Partial<Pick<BaseOrder, 'adminOnlyNote' | 'status'>>

export interface OrderAdminOrderIdPATCHparams {
	orderId: string // Next.js params are always strings!
}

const routeDetail = `${apiPaths.orders.merchantPerspective.update} error: `

// Allows a merchant to change the status or note on an order they've received
export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<OrderAdminOrderIdPATCHparams> },
): Promise<NextResponse<OrderAdminOrderIdPATCHresponse>> {
	try {
		// Extract data
		const unwrappedParams = await params
		const orderId = Number(unwrappedParams.orderId)

		const { adminOnlyNote, status: orderStatus }: OrderAdminOrderIdPATCHbody = await request.json()

		// Check order ID has been provided
		if (!orderId) {
			const developerMessage = logAndSanitiseApiResponse({
				routeDetail,
				message: 'orderId missing',
			})
			return NextResponse.json({ developerMessage }, { status: 400 })
		}

		// Check at least one property to update has been provided
		if (!orderStatus && !adminOnlyNote) {
			const developerMessage = logAndSanitiseApiResponse({
				routeDetail,
				message: 'neither orderStatus nor adminOnlyNote provided. At least one property to update must be provided',
			})
			return NextResponse.json({ developerMessage }, { status: 400 })
		}

		// Validate the order ID
		if (!orderId) {
			const developerMessage = logAndSanitiseApiResponse({
				routeDetail,
				message: 'orderId missing',
			})
			return NextResponse.json({ developerMessage }, { status: 400 })
		}

		if (!Number.isFinite(Number(orderId))) {
			const developerMessage = logAndSanitiseApiResponse({
				routeDetail,
				message: `orderId not a valid number: ${orderId}`,
			})
			return NextResponse.json({ developerMessage }, { status: 400 })
		}

		// Validate orderStatus, if provided
		if (orderStatus) {
			if (!isOrderStatus(orderStatus)) {
				const developerMessage = logAndSanitiseApiResponse({
					routeDetail,
					message: `orderStatus invalid: ${orderStatus}`,
				})
				return NextResponse.json({ developerMessage }, { status: 400 })
			}
		}

		// Validate adminOnlyNote, if provided
		if (adminOnlyNote) {
			if (adminOnlyNote.length > serviceConstraints.maximumCustomerNoteLength) {
				const developerMessage = logAndSanitiseApiResponse({
					routeDetail,
					message: `adminOnlyNote too long: ${adminOnlyNote.length} characters`,
				})
				return NextResponse.json({ developerMessage }, { status: 400 })
			}
			if (containsIllegalCharacters(adminOnlyNote)) {
				const developerMessage = logAndSanitiseApiResponse({
					routeDetail,
					message: 'adminOnlyNote contains illegal characters',
				})
				return NextResponse.json({ developerMessage }, { status: 400 })
			}
		}

		// Extract user ID from token
		const { extractedUserId, status, message: cookieMessage } = await extractIdFromRequestCookie(request)

		if (!extractedUserId) {
			logAndSanitiseApiResponse({
				routeDetail,
				message: cookieMessage,
			})
			return NextResponse.json({ developerMessage: cookieMessage }, { status })
		}

		const { existingDangerousUser } = await checkUserExists(extractedUserId)

		if (!existingDangerousUser) {
			const developerMessage = logAndSanitiseApiResponse({
				routeDetail,
				message: unauthorisedMessages.userNotFound,
			})
			return NextResponse.json({ developerMessage }, { status: 401 })
		}

		// Check user has valid trial or subscription
		const { activeSubscriptionOrTrial } = await checkActiveSubscriptionOrTrial(extractedUserId, existingDangerousUser?.cachedTrialExpired)

		if (!activeSubscriptionOrTrial) {
			const developerMessage = logAndSanitiseApiResponse({
				routeDetail,
				message: authenticationMessages.noActiveTrialSubscription,
			})
			return NextResponse.json({ developerMessage }, { status: 401 })
		}

		const [foundOrder] = await database.select().from(orders).where(eq(orders.id, orderId)).limit(1)

		// Check order exists
		if (!foundOrder) {
			const developerMessage = logAndSanitiseApiResponse({
				routeDetail,
				message: `Order with ID ${orderId} not found`,
			})
			return NextResponse.json({ developerMessage }, { status: 400 })
		}

		// Check order belongs to user
		if (foundOrder.merchantId !== extractedUserId) {
			const developerMessage = logAndSanitiseApiResponse({
				routeDetail,
				message: `Order with ID ${orderId} does not belong to ${existingDangerousUser.businessName} (user ID: ${extractedUserId})`,
			})
			return NextResponse.json({ developerMessage }, { status: 403 })
		}

		// Check there is actually a difference before updating
		let hasChanges = false

		if (adminOnlyNote && foundOrder.adminOnlyNote !== adminOnlyNote) hasChanges = true

		if (orderStatus && foundOrder.status !== orderStatus) hasChanges = true

		if (!hasChanges) {
			const developerMessage = logAndSanitiseApiResponse({
				routeDetail,
				message: 'Nothing to update',
			})
			return NextResponse.json({ developerMessage }, { status: 400 })
		}

		// Update the order

		const [updatedOrder] = await database
			.update(orders)
			.set({ adminOnlyNote, status: orderStatus })
			.where(eq(orders.id, orderId))
			.returning({
				adminOnlyNote: orders.adminOnlyNote,
				status: orders.status,
			})

		if (!updatedOrder) {
			logAndSanitiseApiResponse({
				level: 'level1error',
				routeDetail: routeDetail,
				message: 'Failed to update order',
			})
			return NextResponse.json({ developerMessage: 'Failed to update order' }, { status: httpStatus.http500serverError })
		}

		logAndSanitiseApiResponse({
			level: 'level3info',
			routeDetail: routeDetail,
			message: 'Order updated successfully',
		})
		return NextResponse.json({ userMessage: 'Order updated successfully', updatedOrder }, { status: 200 })
	} catch (error) {
		const developerMessage = logAndSanitiseApiResponse({
			message: 'caught server error',
			routeDetail,
			error,
		})
		return NextResponse.json({ userMessage: userMessages.serverError, developerMessage }, { status: 500 })
	}
}
