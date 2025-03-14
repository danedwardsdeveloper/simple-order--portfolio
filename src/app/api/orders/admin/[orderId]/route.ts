import {
	apiPaths,
	authenticationMessages,
	httpStatus,
	serviceConstraints,
	systemMessages,
	unauthorisedMessages,
	userMessages,
} from '@/library/constants'
import { checkActiveSubscriptionOrTrial, checkUserExists } from '@/library/database/operations'
import logger from '@/library/logger'
import { containsIllegalCharacters, isOrderStatus } from '@/library/utilities'
import { extractIdFromRequestCookie } from '@/library/utilities/server'
import type { Order, OrderReceived, UnauthorisedMessages } from '@/types'
import { type NextRequest, NextResponse } from 'next/server'

// Main ToDo: Keep working in this

export interface OrderAdminOrderIdPATCHresponse {
	message:
		| typeof systemMessages.badRequest
		| typeof systemMessages.success
		| typeof systemMessages.serverError
		| typeof systemMessages.databaseError
		| typeof userMessages.serverError
		| UnauthorisedMessages
	updatedOrder?: OrderReceived
}

export type OrderAdminOrderIdPATCHbody = Pick<Order, 'id'> & Partial<Pick<Order, 'adminOnlyNote' | 'status'>>

export interface OrderAdminOrderIdPATCHparams {
	orderId: string // Next.js params are always strings!
}

const routeDetail = `${apiPaths.orders.merchantPerspective.update} error: `

// Allows a merchant to change the status or note on an order they've received
export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<OrderAdminOrderIdPATCHparams> },
): Promise<NextResponse<OrderAdminOrderIdPATCHresponse>> {
	const unwrappedParams = await params
	const orderId = Number(unwrappedParams.orderId)
	// check order ID has been provided
	const { adminOnlyNote, status: orderStatus }: OrderAdminOrderIdPATCHbody = await request.json()

	let badRequestLog: undefined | Array<string | number> = undefined

	// Validate the order ID
	if (!Number.isFinite(Number(orderId))) badRequestLog = ['orderId not a valid number: ', orderId]
	if (!orderId) badRequestLog = ['id (as orderId) missing']

	// validate orderStatus, if provided
	if (orderStatus) {
		if (!isOrderStatus(orderStatus)) badRequestLog = ['orderStatus invalid: ', orderStatus]
	}

	// Validate adminOnlyNote, if provided
	if (adminOnlyNote) {
		if (adminOnlyNote.length > serviceConstraints.maximumCustomerNoteLength)
			badRequestLog = ['adminOnlyNote too long', adminOnlyNote.length]
		if (containsIllegalCharacters(adminOnlyNote)) badRequestLog = ['adminOnlyNote contains illegal characters']
	}

	if (badRequestLog) {
		logger.warn(routeDetail, badRequestLog.join(' '))
		return NextResponse.json({ message: systemMessages.badRequest }, { status: 400 })
	}

	// - extract user ID from token
	const { extractedUserId, status, message } = await extractIdFromRequestCookie(request)

	if (!extractedUserId) {
		return NextResponse.json({ message }, { status })
	}

	let unauthorisedLog = undefined

	const { existingDangerousUser } = await checkUserExists(extractedUserId)

	if (!existingDangerousUser) unauthorisedLog = unauthorisedMessages.userNotFound

	const { activeSubscriptionOrTrial } = await checkActiveSubscriptionOrTrial(extractedUserId, existingDangerousUser?.cachedTrialExpired)

	if (!activeSubscriptionOrTrial) unauthorisedLog = authenticationMessages.noActiveTrialSubscription

	if (unauthorisedLog) {
		logger.warn(routeDetail, unauthorisedLog)
		return NextResponse.json({ message: unauthorisedMessages.unauthorised }, { status: httpStatus.http401unauthorised })
	}

	// - check user has valid trial or subscription
	// - check order belongs to user
	// - update the order
	// - return the order

	try {
		logger.info(routeDetail, 'Updated order successfully')
		return NextResponse.json({ message: systemMessages.success }, { status: 200 })
	} catch (error) {
		logger.error(routeDetail, error)
		return NextResponse.json({ message: userMessages.serverError }, { status: 500 })
	}
}
