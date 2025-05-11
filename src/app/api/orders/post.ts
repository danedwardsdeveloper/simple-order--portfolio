import { http403forbidden, serviceConstraints, userMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkAccess, checkRelationship, createOrder } from '@/library/database/operations'
import { users } from '@/library/database/schema'
import { containsIllegalCharacters, givesEnoughNotice, isValidDate } from '@/library/utilities/public'
import { equals, initialiseResponder } from '@/library/utilities/server'
import type { OrderMade, SelectedProduct } from '@/types'
import type { NextRequest, NextResponse } from 'next/server'

export interface OrdersPOSTbody {
	merchantSlug: string
	requestedDeliveryDate: Date
	customerNote?: string
	products: SelectedProduct[]
}

export interface OrdersPOSTresponse {
	developmentMessage?: string
	userMessage?: typeof userMessages.serverError | typeof userMessages.cutOffTimeExceeded
	createdOrder?: OrderMade
}

type OutputPOST = Promise<NextResponse<OrdersPOSTresponse>>

// Allows a customer to create a new order
export async function POST(request: NextRequest): OutputPOST {
	const respond = initialiseResponder<OrdersPOSTresponse>()

	let txError: { message: string; status: number } | undefined

	try {
		let rawBody: OrdersPOSTbody
		try {
			rawBody = await request.json()

			if (Object.keys(rawBody).length === 0) {
				return respond({
					status: 400,
					developmentMessage: 'body empty',
				})
			}
		} catch {
			return respond({
				status: 400,
				developmentMessage: 'body missing',
			})
		}

		const { merchantSlug, products, requestedDeliveryDate, customerNote } = rawBody

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

		const enoughNotice = givesEnoughNotice({
			requestedDeliveryDate,
			cutOffTime: merchantProfile.cutOffTime,
			leadTimeDays: merchantProfile.leadTimeDays,
		})

		if (!enoughNotice) {
			return respond({
				body: { userMessage: userMessages.cutOffTimeExceeded },
				status: http403forbidden,
				developmentMessage: 'delivery day not accepted',
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
