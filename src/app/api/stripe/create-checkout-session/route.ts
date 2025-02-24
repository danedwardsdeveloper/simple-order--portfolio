import { apiPaths } from '@/library/constants'
import { dynamicBaseURL } from '@/library/environment/publicVariables'
import logger from '@/library/logger'
import stripeClient from '@/library/stripeClient'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(_request: NextRequest) {
	try {
		const session = await stripeClient.checkout.sessions.create({
			billing_address_collection: 'auto',
			line_items: [
				{
					price: 'price_1QvcZAKCyKQPfgmWyYeynNh3',
					quantity: 1,
				},
			],
			mode: 'subscription',
			success_url: `${dynamicBaseURL}/checkout?success=true&session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${dynamicBaseURL}/checkout?success=false`,
		})

		if (!session.url) {
			logger.error(`${apiPaths.stripe.createCheckoutSession} error: session.url missing`)
		}

		return NextResponse.redirect(session.url || '', { status: 303 })
	} catch (error) {
		logger.error(`${apiPaths.stripe.createCheckoutSession} error`, error)
		return NextResponse.json({ message: 'server error' }, { status: 500 })
	}
}
