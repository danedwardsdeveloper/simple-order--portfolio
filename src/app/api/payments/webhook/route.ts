import { http503serviceUnavailable, userMessages } from '@/library/constants'
import { stripeWebhookSecret } from '@/library/environment/serverVariables'
import stripeClient from '@/library/stripe/stripeClient'
import { webhookHandler } from '@/library/stripe/webhookHandler'
import { initialiseResponder } from '@/library/utilities/server'
import { headers } from 'next/headers'
import type { NextRequest, NextResponse } from 'next/server'

interface StripeWebhookPOSTresponse {
	// message: 'success' is required by Stripe. Do not change!
	message: 'success' | 'service unavailable' | 'server error'

	userMessage?: typeof userMessages.serverError
}

type Output = Promise<NextResponse<StripeWebhookPOSTresponse>>

export async function POST(request: NextRequest): Output {
	const respond = initialiseResponder<StripeWebhookPOSTresponse>()

	try {
		const rawBody = await request.text()
		const headersList = await headers()
		const stripeSignature = headersList.get('stripe-signature')

		if (stripeWebhookSecret && stripeSignature) {
			const event = stripeClient.webhooks.constructEvent(rawBody, stripeSignature, stripeWebhookSecret)

			await webhookHandler(event)

			return respond({
				body: { message: 'success' },
				status: 200,
			})
		}

		return respond({
			body: { message: 'service unavailable' },
			status: http503serviceUnavailable,
		})
	} catch (caughtError) {
		return respond({
			body: {
				message: 'server error', //
				userMessage: userMessages.serverError,
			},
			status: 500,
			caughtError,
		})
	}
}
