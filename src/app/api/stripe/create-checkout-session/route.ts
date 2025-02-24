import { apiPaths, basicMessages, httpStatus, missingFieldMessages, tokenMessages } from '@/library/constants'
import { checkUserExists } from '@/library/database/operations'
import { dynamicBaseURL } from '@/library/environment/publicVariables'
import logger from '@/library/logger'
import stripeClient from '@/library/stripe/stripeClient'
import { extractIdFromRequestCookie } from '@/library/utilities/server'
import type { TokenMessages } from '@/types'
import { type NextRequest, NextResponse } from 'next/server'

export interface StripeCreateCheckoutSessionPOSTbody {
	email: string
}

export interface StripeCreateCheckoutSessionPOSTresponse {
	message:
		| typeof basicMessages.success
		| typeof basicMessages.serverError
		| typeof basicMessages.serviceUnavailable
		| typeof missingFieldMessages.emailMissing
		| TokenMessages
	redirectUrl?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<StripeCreateCheckoutSessionPOSTresponse>> {
	try {
		const { email }: StripeCreateCheckoutSessionPOSTbody = await request.json()

		if (!email) return NextResponse.json({ message: missingFieldMessages.emailMissing }, { status: httpStatus.http400badRequest })

		// Check signed in etc.
		const { extractedUserId, status, message } = await extractIdFromRequestCookie(request)

		if (!extractedUserId) {
			return NextResponse.json({ message }, { status })
		}

		const { userExists } = await checkUserExists(extractedUserId)
		if (!userExists) {
			return NextResponse.json({ message: tokenMessages.userNotFound }, { status: httpStatus.http401unauthorised })
		}

		const { url } = await stripeClient.checkout.sessions.create({
			billing_address_collection: 'auto',
			customer_email: email,
			subscription_data: {
				metadata: {
					simpleOrderUserId: extractedUserId,
				},
			},
			line_items: [
				{
					price: 'price_1QvcZAKCyKQPfgmWyYeynNh3',
					quantity: 1,
				},
			],
			mode: 'subscription',
			// Enhancement ToDo: add specific success feedback with &session_id={CHECKOUT_SESSION_ID}
			success_url: `${dynamicBaseURL}/checkout?success=true`,
			cancel_url: `${dynamicBaseURL}/checkout?success=false`,
		})

		if (url) {
			logger.info(`${apiPaths.stripe.createCheckoutSession}. Redirect url: ${url}`)
			return NextResponse.json({ message: basicMessages.success, redirectUrl: url }, { status: httpStatus.http200ok })
		}

		logger.error(`${apiPaths.stripe.createCheckoutSession} error: session.url missing`)
		return NextResponse.json({ message: 'service unavailable' }, { status: httpStatus.http503serviceUnavailable })
	} catch (error) {
		logger.error(`${apiPaths.stripe.createCheckoutSession} error`, error)
		return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
	}
}
