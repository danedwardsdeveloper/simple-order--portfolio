import { apiPaths, userMessages } from '@/library/constants'
import { checkoutSearchParam, checkoutSearchParamValues } from '@/library/constants/definitions/checkoutSearchParams'
import { checkAccess } from '@/library/database/operations'
import { dynamicBaseURL } from '@/library/environment/publicVariables'
import stripeClient from '@/library/stripe/stripeClient'
import { initialiseDevelopmentLogger } from '@/library/utilities/public'
import { type NextRequest, NextResponse } from 'next/server'

export interface CheckoutSessionPOSTbody {
	email: string
}

export interface CheckoutSessionPOSTresponse {
	userMessage?: typeof userMessages.stripeCreateCheckoutError
	developmentMessage?: string
	redirectUrl?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<CheckoutSessionPOSTresponse>> {
	const routeSignature = `POST ${apiPaths.payments.createCheckoutSession}`
	const developmentLogger = initialiseDevelopmentLogger(routeSignature)

	try {
		const { email }: CheckoutSessionPOSTbody = await request.json()

		if (!email) {
			const developmentMessage = developmentLogger('email missing')
			return NextResponse.json({ developmentMessage }, { status: 400 })
		}

		const { dangerousUser } = await checkAccess({
			request,
			routeSignature,
			requireConfirmed: true,
			requireSubscriptionOrTrial: false,
		})

		if (!dangerousUser) {
			return NextResponse.json({}, { status: 401 })
		}

		const customMetadata = {
			simpleOrderUserId: dangerousUser.id.toString(),
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
			return NextResponse.json({ redirectUrl: url }, { status: 200 })
		}

		const developmentMessage = developmentLogger('Redirect URL not received')
		return NextResponse.json({ developmentMessage, userMessage: userMessages.stripeCreateCheckoutError }, { status: 503 })
	} catch (error) {
		const developmentMessage = developmentLogger('Error getting redirect URL', error)
		return NextResponse.json({ developmentMessage, userMessage: userMessages.stripeCreateCheckoutError }, { status: 500 })
	}
}
