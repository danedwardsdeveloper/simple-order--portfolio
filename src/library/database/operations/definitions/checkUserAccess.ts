import { logAndSanitiseApiResponse } from '@/library/utilities/public'
import { extractIdFromRequestCookie } from '@/library/utilities/server'
import { and, equals, greaterThan } from '@/library/utilities/server'
import type { DangerousBaseUser } from '@/types'
import type { NextRequest } from 'next/server'
import { database } from '../../connection'
import { freeTrials, subscriptions, users } from '../../schema'
import { getUserRoles } from './getUserRoles'

interface Input {
	request: NextRequest
	routeDetail: string
	requireConfirmed?: boolean
	requireSubscriptionOrTrial?: boolean
}

type Output = Promise<{
	success: boolean
	developerMessage?: string
	foundDangerousUser?: DangerousBaseUser
}>

export async function checkAuthentication({
	request,
	routeDetail,
	requireConfirmed = true,
	requireSubscriptionOrTrial = true,
}: Input): Output {
	const { extractedUserId } = await extractIdFromRequestCookie(request)

	let developerMessage = undefined

	if (!extractedUserId) {
		developerMessage = logAndSanitiseApiResponse({ routeDetail, message: '' })
		return { success: false, developerMessage }
	}

	const [foundDangerousUser] = await database.select().from(users).where(equals(users.id, extractedUserId))

	if (!foundDangerousUser) {
		developerMessage = logAndSanitiseApiResponse({ routeDetail, message: '' })
		return { success: false }
	}

	if (requireConfirmed && !foundDangerousUser.emailConfirmed) {
		developerMessage = logAndSanitiseApiResponse({ routeDetail, message: 'email not confirmed' })
		return { success: false }
	}

	if (requireSubscriptionOrTrial) {
		const _validSubscriptionOrTrial = false
		if (!foundDangerousUser.cachedTrialExpired) {
		} else {
			const [_validFreeTrial] = await database
				.select()
				.from(freeTrials)
				.where(and(greaterThan(freeTrials.endDate, new Date()), equals(freeTrials.userId, foundDangerousUser.id)))
		}
	}

	return { success: true, foundDangerousUser }
}

export async function checkUserAccess({
	request,
	routeDetail,
	requireConfirmed = true,
	requireSubscriptionOrTrial = false,
	checkRoles = false,
	checkRelationship = null,
}) {
	const { extractedUserId } = await extractIdFromRequestCookie(request)

	if (!extractedUserId) return { success: false, message: 'Not authenticated' }

	const [foundUser] = await database.select().from(users).where(equals(users.id, extractedUserId))
	if (!foundUser) return { success: false, message: 'User not found' }

	if (requireConfirmed && !foundUser.emailConfirmed) {
		return { success: false, message: 'Email not confirmed' }
	}

	let hasActiveSubscription = false
	if (requireSubscriptionOrTrial) {
		// Check cached trial status
		if (!foundUser.cachedTrialExpired) {
			hasActiveSubscription = true // What???? ToDo
		} else {
			const [validFreeTrial] = await database
				.select()
				.from(freeTrials)
				.where(and(greaterThan(freeTrials.endDate, new Date()), equals(freeTrials.userId, foundUser.id)))

			if (!validFreeTrial) {
				const [validSubscription] = await database
					.select()
					.from(subscriptions)
					.where(and(greaterThan(subscriptions.currentPeriodEnd, new Date()), equals(subscriptions.userId, foundUser.id)))

				hasActiveSubscription = Boolean(validSubscription)
			} else {
				hasActiveSubscription = true
			}
		}

		if (!hasActiveSubscription) {
			return { success: false, message: 'No active subscription or trial' }
		}
	}

	let userRole = undefined
	if (checkRoles) {
		const { userRole: role } = await getUserRoles(foundUser)
		userRole = role
	}

	let relationshipStatus = undefined
	if (checkRelationship) {
		const { relationshipExists } = await checkRelationship({
			merchantId: userRole === 'merchant' ? foundUser.id : checkRelationship,
			customerId: userRole === 'customer' ? foundUser.id : checkRelationship,
		})
		relationshipStatus = relationshipExists
	}

	return {
		success: true,
		user: foundUser,
		hasActiveSubscription,
		userRole,
		relationshipStatus,
	}
}
