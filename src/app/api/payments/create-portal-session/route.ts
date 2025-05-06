import { userMessages } from '@/library/constants'
import { database } from '@/library/database/connection'
import { checkAccess } from '@/library/database/operations'
import { subscriptions } from '@/library/database/schema'
import { dynamicBaseURL } from '@/library/environment/publicVariables'
import stripe from '@/library/stripe/stripeClient'
import { equals, initialiseResponder } from '@/library/utilities/server'
import type { UserMessages } from '@/types'
import type { NextRequest, NextResponse } from 'next/server'

export type PortalSessionPOSTresponse = {
	redirectUrl?: string
	userMessage?: UserMessages
	developmentMessage?: string
}

export type Output = Promise<NextResponse<PortalSessionPOSTresponse>>

export async function POST(request: NextRequest): Output {
	const respond = initialiseResponder<PortalSessionPOSTresponse>()

	const { dangerousUser, accessDenied } = await checkAccess({
		request,
		requireConfirmed: true,
		requireSubscriptionOrTrial: false, // False for overdue subscriptions
	})

	if (accessDenied) {
		return respond({
			status: accessDenied.status,
			developmentMessage: accessDenied.message,
		})
	}

	const [{ stripeCustomerId }] = await database
		.select({ stripeCustomerId: subscriptions.stripeCustomerId })
		.from(subscriptions)
		.where(equals(subscriptions.userId, dangerousUser.id))

	try {
		const { url: redirectUrl } = await stripe.billingPortal.sessions.create({
			customer: stripeCustomerId,
			return_url: `${dynamicBaseURL}/settings`,
		})

		return respond({
			body: { redirectUrl },
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
