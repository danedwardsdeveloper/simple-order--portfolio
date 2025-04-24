import { serviceConstraints, userMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkAccess, checkRelationship, createOrder, getOrdersData } from '@/library/database/operations'
import { users } from '@/library/database/schema'
import { containsIllegalCharacters, initialiseDevelopmentLogger, isValidDate, mapOrders } from '@/library/utilities/public'
import { equals } from '@/library/utilities/server'
import type { OrderMade, SelectedProduct } from '@/types'
import { type NextRequest, NextResponse } from 'next/server'

export interface OrdersGETresponse {
	developmentMessage?: string
	userMessage?: typeof userMessages.serverError
	ordersMade?: OrderMade[]
}

/**
 * Get orders that you have placed as a customer
 */
export async function GET(request: NextRequest): Promise<NextResponse<OrdersGETresponse>> {
	const routeSignatureGET = 'GET /api/orders'
	const developmentLogger = initialiseDevelopmentLogger(routeSignatureGET)

	try {
		const { dangerousUser } = await checkAccess({
			request,
			routeSignature: routeSignatureGET,
			requireSubscriptionOrTrial: false,

			// requireConfirmed doesn't matter here
			// You can't make an order without being confirmed so there will never be anything to see
			requireConfirmed: false,
		})

		if (!dangerousUser) {
			const developmentMessage = developmentLogger('user not found')
			return NextResponse.json({ developmentMessage }, { status: 400 })
		}

		const { ordersMadeData } = await getOrdersData({
			userId: dangerousUser.id,
			returnType: 'ordersMade',
			routeSignature: routeSignatureGET,
		})

		if (!ordersMadeData) {
			const developmentMessage = developmentLogger('Legitimately no orders found', { level: 'level3success' })
			return NextResponse.json({ developmentMessage }, { status: 200 })
		}

		const { ordersMade } = mapOrders({
			orders: ordersMadeData.orders,
			orderItems: ordersMadeData.orderItems,
			merchants: ordersMadeData.merchants,
			products: ordersMadeData.products,
			returnType: 'ordersMade',
		})

		return NextResponse.json({ ordersMade }, { status: 200 })
	} catch {
		return NextResponse.json({ userMessage: userMessages.serverError }, { status: 500 })
	}
}

export interface OrdersPOSTbody {
	merchantSlug: string
	requestedDeliveryDate: Date
	customerNote?: string
	products: SelectedProduct[]
}

export interface OrdersPOSTresponse {
	developmentMessage?: string
	userMessage?: typeof userMessages.serverError
	createdOrder?: OrderMade
}

/**
 * Allows a customer to create a new order
 */
export async function POST(request: NextRequest): Promise<NextResponse<OrdersPOSTresponse>> {
	const routeSignaturePOST = 'POST /api/orders'
	const developmentLogger = initialiseDevelopmentLogger(routeSignaturePOST)

	let txErrorMessage: string | undefined
	let txErrorCode: number | undefined

	try {
		// ToDo: Prevent route from crashing with missing body

		const { merchantSlug, products, requestedDeliveryDate, customerNote }: OrdersPOSTbody = await request.json()

		let badRequestMessage = undefined

		if (!merchantSlug) badRequestMessage = 'merchantSlug Missing'
		if (!products) badRequestMessage = 'products Missing'
		if (!requestedDeliveryDate) badRequestMessage = 'requestedDeliveryDate missing'

		const parsedDate = new Date(requestedDeliveryDate)

		if (!isValidDate(parsedDate)) badRequestMessage = 'requestedDeliveryDate invalid'

		if (badRequestMessage) {
			const developmentMessage = developmentLogger(badRequestMessage)
			return NextResponse.json({ developmentMessage }, { status: 400 })
		}

		const { dangerousUser } = await checkAccess({
			routeSignature: routeSignaturePOST,
			request,
			requireConfirmed: true,
			requireSubscriptionOrTrial: false,
		})

		if (!dangerousUser) {
			const developmentMessage = developmentLogger('Unauthorised')
			return NextResponse.json({ developmentMessage }, { status: 401 })
		}

		if (merchantSlug === dangerousUser.slug) {
			const developmentMessage = developmentLogger('attempted to order from self')
			return NextResponse.json({ developmentMessage }, { status: 400 })
		}

		if (customerNote) {
			let customerNoteError = undefined

			if (typeof customerNote !== 'string') customerNoteError = 'customerNote should be a string'

			if (containsIllegalCharacters(customerNote)) customerNoteError = 'customerNote contains illegal characters'

			if (customerNote.length > serviceConstraints.maximumCustomerNoteLength) {
				customerNoteError = 'customerNote exceeds service constraints'
			}

			if (customerNoteError) {
				const developmentMessage = developmentLogger(customerNoteError)
				return NextResponse.json({ developmentMessage }, { status: 400 })
			}
		}

		// This relationship checking logic can be moved to checkAccess
		const [merchantProfile] = await database.select().from(users).where(equals(users.slug, merchantSlug)).limit(1)

		if (!merchantProfile) {
			const developmentMessage = developmentLogger(`merchant with slug ${merchantSlug} not found`)
			return NextResponse.json({ developmentMessage }, { status: 400 })
		}

		const relationshipExists = await checkRelationship({ merchantId: merchantProfile.id, customerId: dangerousUser.id })

		if (!relationshipExists) {
			const developmentMessage = developmentLogger(`No relationship found between customer ${dangerousUser.slug} and ${merchantSlug}`)
			return NextResponse.json({ developmentMessage }, { status: 400 })
		}

		const createdOrder = await createOrder({
			customerId: dangerousUser.id,
			merchantProfile,
			requestedDeliveryDate: parsedDate,
			customerNote,
			products,
		})

		const developmentMessage = developmentLogger(
			`${dangerousUser.businessName} successfully created a new order from ${merchantProfile.businessName}`,
			{ level: 'level3success' },
		)
		return NextResponse.json({ developmentMessage, createdOrder }, { status: 201 })
	} catch (error) {
		const developmentMessage = developmentLogger(txErrorMessage || 'Caught error', { error })
		return NextResponse.json({ developmentMessage, userMessage: userMessages.serverError }, { status: txErrorCode || 500 })
	}
}
