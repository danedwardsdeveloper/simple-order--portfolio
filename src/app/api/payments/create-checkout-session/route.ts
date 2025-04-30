import { userMessages } from '@/library/constants'
import { checkoutSearchParam, checkoutSearchParamValues } from '@/library/constants/definitions/checkoutSearchParams'
import { checkAccess } from '@/library/database/operations'
import { dynamicBaseURL } from '@/library/environment/publicVariables'
import stripeClient from '@/library/stripe/stripeClient'
import { initialiseResponder } from '@/library/utilities/server'
import type { NextRequest, NextResponse } from 'next/server'

export interface CheckoutSessionPOSTbody {
	email: string
}

export interface CheckoutSessionPOSTresponse {
	userMessage?: typeof userMessages.stripeCreateCheckoutError
	developmentMessage?: string
	redirectUrl?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<CheckoutSessionPOSTresponse>> {
	const respond = initialiseResponder<CheckoutSessionPOSTresponse>()

	try {
		const { email }: CheckoutSessionPOSTbody = await request.json()

		if (!email) {
			return respond({
				status: 400,
				developmentMessage: 'email missing',
			})
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

		const customMetadata = {
			simpleOrderUserId: String(dangerousUser.id),
		}

		const { url } = await stripeClient.checkout.sessions.create({
			billing_address_collection: 'auto',
			customer_email: email,
			metadata: customMetadata,
			subscription_data: {
				metadata: customMetadata,
			},
			line_items: [
				{
					price: 'price_1QvcZAKCyKQPfgmWyYeynNh3',
					quantity: 1,
				},
			],
			mode: 'subscription',
			success_url: `${dynamicBaseURL}/settings?${checkoutSearchParam}=${checkoutSearchParamValues.success}`,
			cancel_url: `${dynamicBaseURL}/settings?${checkoutSearchParam}=${checkoutSearchParamValues.incomplete}`,
		})

		if (url) {
			return respond({
				body: { redirectUrl: url },
				status: 200,
				developmentMessage: 'Success',
			})
		}

		return respond({
			body: { userMessage: userMessages.stripeCreateCheckoutError },
			status: 503,
			developmentMessage: 'Redirect URL not received',
		})
	} catch (caughtError) {
		return respond({
			body: { userMessage: userMessages.stripeCreateCheckoutError },
			status: 500,
			caughtError,
		})
	}
}
