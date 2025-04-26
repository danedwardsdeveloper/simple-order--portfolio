import { stripeWebhookSecret } from '@/library/environment/serverVariables'
import stripeClient from '@/library/stripe/stripeClient'
import { webhookHandler } from '@/library/stripe/webhookHandler'
import { initialiseDevelopmentLogger } from '@/library/utilities/public'
import { headers } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

interface StripeWebhookPOSTresponse {
	message: 'success' | 'service unavailable' | 'server error'
}

export async function POST(request: NextRequest): Promise<NextResponse<StripeWebhookPOSTresponse>> {
	const developmentLogger = initialiseDevelopmentLogger('/payments/webhook', 'POST')
	try {
		const rawBody = await request.text()
		const headersList = await headers()
		const stripeSignature = headersList.get('stripe-signature')

		if (stripeWebhookSecret && stripeSignature) {
			try {
				const event = stripeClient.webhooks.constructEvent(rawBody, stripeSignature, stripeWebhookSecret)

				await webhookHandler(event)

				return NextResponse.json({ message: 'success' }, { status: 200 })
			} catch (error) {
				const developmentMessage = developmentLogger('Caught error', { error })
				return NextResponse.json({ developmentMessage, message: 'service unavailable' }, { status: 503 })
			}
		}
		const developmentMessage = developmentLogger('Failed to handle webhook')
		return NextResponse.json({ developmentMessage, message: 'server error' }, { status: 500 })
	} catch (error) {
		const developmentMessage = developmentLogger('Caught error', { error })
		return NextResponse.json({ developmentMessage, message: 'server error' }, { status: 500 })
	}
}
