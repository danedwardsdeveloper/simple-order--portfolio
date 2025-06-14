import { http403forbidden, userMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkAccess, checkRelationship, getAcceptedWeekDayIndices, getHolidays } from '@/library/database/operations'
import { products, users } from '@/library/database/schema'
import { emptyToUndefined, getAvailableDeliveryDays } from '@/library/utilities/public'
import { and, equals, initialiseResponder, isNull } from '@/library/utilities/server'
import type { ApiResponse, BrowserSafeCustomerProduct } from '@/types'
import type { NextRequest, NextResponse } from 'next/server'

type Success = {
	ok: true
	availableProducts?: BrowserSafeCustomerProduct[]
	availableDeliveryDays?: Date[]
	// The customer already has the merchantProfile because they've made the request using the slug
}

type Failure = {
	ok: false
	userMessage: (typeof userMessages)['authenticationError' | 'serverError' | 'unexpectedError']
}

export type InventoryMerchantSlugGETresponse = ApiResponse<Success, Failure>

type Output = Promise<NextResponse<InventoryMerchantSlugGETresponse>>

// Get all everything needed to make an order from a specific merchant
export async function GET(request: NextRequest, { params }: { params: Promise<{ merchantSlug: string }> }): Output {
	const respond = initialiseResponder<Success, Failure>()
	try {
		const merchantSlug = (await params).merchantSlug

		const { dangerousUser, accessDenied } = await checkAccess({
			request,
			requireConfirmed: true,
			requireSubscriptionOrTrial: false, // Allow customers (who don't have a trial or subscription) to make orders
		})

		if (accessDenied) {
			return respond({
				body: { userMessage: userMessages.authenticationError },
				status: accessDenied.status,
				developmentMessage: accessDenied.message,
			})
		}

		const [dangerousMerchantProfile] = await database.select().from(users).where(equals(users.slug, merchantSlug))

		if (!dangerousMerchantProfile) {
			return respond({
				body: { userMessage: userMessages.unexpectedError },
				status: 401,
				developmentMessage: 'merchant not found',
			})
		}

		const { id: merchantId, cutOffTime, leadTimeDays } = dangerousMerchantProfile

		const { relationshipExists } = await checkRelationship({ customerId: dangerousUser.id, merchantId: merchantId })

		if (!relationshipExists) {
			return respond({
				body: { userMessage: userMessages.unexpectedError },
				status: http403forbidden,
				developmentMessage: 'Relationship missing',
			})
		}

		const availableProducts = emptyToUndefined(
			await database
				.select({
					id: products.id,
					name: products.name,
					description: products.description,
					priceInMinorUnits: products.priceInMinorUnits,
					customVat: products.customVat,
				})
				.from(products)
				.where(and(equals(products.ownerId, merchantId), isNull(products.deletedAt))),
		)

		const acceptedWeekDayIndices = await getAcceptedWeekDayIndices(merchantId)

		const lookAheadDays = 14

		const holidays = await getHolidays({
			userId: dangerousMerchantProfile.id, //
			lookAheadDays,
		})

		const availableDeliveryDays = getAvailableDeliveryDays({
			acceptedWeekDayIndices,
			holidays,
			lookAheadDays,
			cutOffTime,
			leadTimeDays,
		})

		if (!availableDeliveryDays) {
			return respond({
				// ToDo: Proper message / make this scenario impossible beforehand
				body: { userMessage: userMessages.unexpectedError },
				status: 400,
				developmentMessage: 'No delivery days available',
			})
		}

		return respond({
			body: {
				availableProducts,
				...(availableDeliveryDays ? { availableDeliveryDays } : {}),
			},
			status: 200,
		})
	} catch (caughtError) {
		return respond({
			body: { userMessage: userMessages.serverError },
			status: 500,
			caughtError,
		})
	}
}
