import { serviceConstraints, userMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkAccess, checkRelationship, createOrder, getOrdersData } from '@/library/database/operations'
import { users } from '@/library/database/schema'
import { containsIllegalCharacters, isValidDate, mapOrders } from '@/library/utilities/public'
import { equals, initialiseResponder } from '@/library/utilities/server'
import type { OrderMade, SelectedProduct } from '@/types'
import type { NextRequest, NextResponse } from 'next/server'

export interface OrdersGETresponse {
	developmentMessage?: string
	userMessage?: typeof userMessages.serverError
	ordersMade?: OrderMade[]
}

type OutputGET = Promise<NextResponse<OrdersGETresponse>>

// Get orders that you have placed as a customer
export async function GET(request: NextRequest): OutputGET {
	const respond = initialiseResponder<OrdersGETresponse>()

	try {
		const { dangerousUser, accessDenied } = await checkAccess({
			request,
			requireConfirmed: false,
			requireSubscriptionOrTrial: false,
		})

		if (accessDenied) {
			return respond({
				status: accessDenied.status,
				developmentMessage: accessDenied.message,
			})
		}

		const { ordersMadeData } = await getOrdersData({
			userId: dangerousUser.id,
			returnType: 'ordersMade',
			routeSignature: '',
		})

		if (!ordersMadeData) {
			return respond({
				status: 200,
				developmentMessage: 'Legitimately no orders found',
			})
		}

		const { ordersMade } = mapOrders({
			orders: ordersMadeData.orders,
			orderItems: ordersMadeData.orderItems,
			merchants: ordersMadeData.merchants,
			products: ordersMadeData.products,
			returnType: 'ordersMade',
		})

		return respond({
			body: { ordersMade },
			status: 200,
		})
	} catch (caughtError) {
		return respond({
			status: 500,
			caughtError,
		})
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

type OutputPOST = Promise<NextResponse<OrdersPOSTresponse>>

// Allows a customer to create a new order
export async function POST(request: NextRequest): OutputPOST {
	const respond = initialiseResponder<OrdersPOSTresponse>()

	let txError: { message: string; status: number } | undefined

	try {
		// ToDo: Prevent route from crashing with missing body

		const { merchantSlug, products, requestedDeliveryDate, customerNote }: OrdersPOSTbody = await request.json()

		let badRequestMessage = undefined

		// ToDo: use Zod
		if (!merchantSlug) badRequestMessage = 'merchantSlug Missing'
		if (!products) badRequestMessage = 'products Missing'
		if (!requestedDeliveryDate) badRequestMessage = 'requestedDeliveryDate missing'

		const parsedDate = new Date(requestedDeliveryDate)

		if (!isValidDate(parsedDate)) badRequestMessage = 'requestedDeliveryDate invalid'

		if (badRequestMessage) {
			return respond({
				status: 400,
				developmentMessage: badRequestMessage,
			})
		}

		const { dangerousUser, accessDenied } = await checkAccess({
			request,
			requireConfirmed: true,
			requireSubscriptionOrTrial: false,
		})

		if (accessDenied) {
			return respond({
				status: accessDenied.status,
				developmentMessage: accessDenied.message,
			})
		}

		if (merchantSlug === dangerousUser.slug) {
			return respond({
				status: 400,
				developmentMessage: 'attempted to order from self',
			})
		}

		if (customerNote) {
			let customerNoteError = undefined

			if (typeof customerNote !== 'string') customerNoteError = 'customerNote should be a string'

			if (containsIllegalCharacters(customerNote)) customerNoteError = 'customerNote contains illegal characters'

			if (customerNote.length > serviceConstraints.maximumCustomerNoteLength) {
				customerNoteError = 'customerNote exceeds service constraints'
			}

			if (customerNoteError) {
				return respond({
					status: 400,
					developmentMessage: customerNoteError,
				})
			}
		}

		// This relationship checking logic can be moved to checkAccess
		const [merchantProfile] = await database.select().from(users).where(equals(users.slug, merchantSlug)).limit(1)

		if (!merchantProfile) {
			return respond({
				status: 400,
				developmentMessage: `merchant with slug ${merchantSlug} not found`,
			})
		}

		const relationshipExists = await checkRelationship({ merchantId: merchantProfile.id, customerId: dangerousUser.id })

		if (!relationshipExists) {
			return respond({
				status: 400,
				developmentMessage: `No relationship found between customer ${dangerousUser.slug} and ${merchantSlug}`,
			})
		}

		const createdOrder = await createOrder({
			customerId: dangerousUser.id,
			merchantProfile,
			requestedDeliveryDate: parsedDate,
			customerNote,
			products,
		})

		return respond({
			body: { createdOrder },
			status: 201,
			developmentMessage: `${dangerousUser.businessName} successfully created a new order from ${merchantProfile.businessName}`,
		})
	} catch (caughtError) {
		return respond({
			body: { userMessage: userMessages.serverError },
			status: txError?.status || 500,
			developmentMessage: txError?.message,
			caughtError,
		})
	}
}
