import { apiPaths, basicMessages, httpStatus } from '@/library/constants'
import { stripeWebhookSecret } from '@/library/environment/serverVariables'
import logger from '@/library/logger'
import stripeClient from '@/library/stripe/stripeClient'
import { webhookHandler } from '@/library/stripe/webhookHandler'
import { headers } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

interface StripeWebhookPOSTresponse {
	message: typeof basicMessages.success | typeof basicMessages.serverError | typeof basicMessages.serviceUnavailable
}

export async function POST(request: NextRequest): Promise<NextResponse<StripeWebhookPOSTresponse>> {
	const rawBody = await request.text()
	const headersList = await headers()
	const stripeSignature = headersList.get('stripe-signature')

	if (stripeWebhookSecret && stripeSignature) {
		try {
			const event = stripeClient.webhooks.constructEvent(rawBody, stripeSignature, stripeWebhookSecret)

			await webhookHandler(event)

			return NextResponse.json({ message: 'success' }, { status: httpStatus.http200ok })
		} catch (error) {
			logger.error(`${apiPaths.stripe.webhook} error: `, error)
			return NextResponse.json({ message: basicMessages.serviceUnavailable }, { status: httpStatus.http503serviceUnavailable })
		}
	}
	return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
}
