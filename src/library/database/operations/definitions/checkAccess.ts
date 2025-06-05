import { database } from '@/library/database/connection'
import { users } from '@/library/database/schema'
import { equals, validateToken } from '@/library/utilities/server'
import type { DangerousBaseUser } from '@/types'
import type { NextRequest } from 'next/server'
import { checkActiveSubscriptionOrTrial } from './checkActiveSubscriptionOrTrial'

type Input = {
	request: NextRequest
	requireConfirmed: boolean
	requireSubscriptionOrTrial: boolean
}

type Output = Promise<
	| { accessDenied: { message: string; status: number }; dangerousUser?: never; trialEnd?: never; subscriptionEnd?: never }
	| { accessDenied?: never; dangerousUser: DangerousBaseUser; trialEnd?: Date; subscriptionEnd?: Date }
>
/**
 * @example
		const { dangerousUser, accessDenied } = await checkAccess({
			request,
			requireConfirmed: true,
			requireSubscriptionOrTrial: true,
		})

		if (accessDenied) {
			return respond({
				status: accessDenied.status,
				developmentMessage: accessDenied.message
			})
		}
 */
export async function checkAccess({ request, requireConfirmed, requireSubscriptionOrTrial }: Input): Output {
	const { tokenInvalid, extractedUserId } = await validateToken(request)

	if (tokenInvalid) {
		return { accessDenied: { message: tokenInvalid.message, status: 401 } }
	}

	const [dangerousUser] = await database.select().from(users).where(equals(users.id, extractedUserId))

	if (!dangerousUser) {
		return { accessDenied: { message: 'user not found', status: 401 } }
	}

	if (requireConfirmed && !dangerousUser.emailConfirmed) {
		return { accessDenied: { message: 'email not confirmed', status: 403 } }
	}

	const { trialEnd, subscriptionEnd } = await checkActiveSubscriptionOrTrial(dangerousUser.id)

	if (requireSubscriptionOrTrial) {
		if (!trialEnd && !subscriptionEnd) return { accessDenied: { message: 'active subscription or trial required', status: 403 } }
	}

	return { dangerousUser, trialEnd, subscriptionEnd }
}
