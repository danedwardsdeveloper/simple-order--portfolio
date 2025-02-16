import { and, eq, gt } from 'drizzle-orm'

import { freeTrials, merchantProfiles, products, subscriptions, users } from '@/library/database/schema'

import type { BaseUser, ClientProduct } from '@/types'
import { database } from './connection'

interface CheckUserExistsResponse {
	userExists: boolean
	existingUser?: {
		emailConfirmed: boolean
		cachedTrialExpired: boolean
		businessName: string
		email: string
	}
}

export async function checkUserExists(userId: number): Promise<CheckUserExistsResponse> {
	const [existingUser]: BaseUser[] = await database.select().from(users).where(eq(users.id, userId)).limit(1)

	if (!existingUser) return { userExists: false }

	return {
		userExists: true,
		existingUser: {
			emailConfirmed: existingUser.emailConfirmed,
			cachedTrialExpired: existingUser.cachedTrialExpired,
			businessName: existingUser.businessName,
			email: existingUser.email,
		},
	}
}

export async function checkMerchantProfileExists(userId: number): Promise<{ merchantProfileExists: boolean; slug: string }> {
	const [merchantProfile] = await database
		.select({ slug: merchantProfiles.slug })
		.from(merchantProfiles)
		.where(eq(merchantProfiles.userId, userId))
		.limit(1)

	return { merchantProfileExists: !!merchantProfile, slug: merchantProfile.slug }
}

/* Usage
 */
export async function getInventory(userId: number): Promise<ClientProduct[]> {
	const inventory: ClientProduct[] = await database
		.select({
			id: products.id,
			merchantProfileId: products.merchantProfileId,
			name: products.name,
			description: products.description,
			priceInMinorUnits: products.priceInMinorUnits,
			customVat: products.customVat,
		})
		.from(products)
		.where(eq(products.merchantProfileId, userId))
	return inventory
}

// Helper function. Used twice in checkActiveSubscriptionOrTrial to avoid looking in free_trials if cached_trial_expired is true
async function checkActiveSubscription(userId: number): Promise<boolean> {
	const [validSubscription] = await database
		.select()
		.from(subscriptions)
		.where(and(gt(subscriptions.currentPeriodEnd, new Date()), eq(subscriptions.userId, userId)))
		.limit(1)

	if (validSubscription) return true
	return false
}

/* Usage
const { validSubscriptionOrTrial } = await checkActiveSubscriptionOrTrial(extractedUserId, cachedTrialExpired)
*/
export async function checkActiveSubscriptionOrTrial(
	userId: number,
	cachedTrialExpired = false,
): Promise<{ validSubscriptionOrTrial: boolean }> {
	if (cachedTrialExpired) {
		const validSubscription = await checkActiveSubscription(userId)
		if (validSubscription) return { validSubscriptionOrTrial: true }
	}

	const [validFreeTrial] = await database
		.select()
		.from(freeTrials)
		.where(and(gt(freeTrials.endDate, new Date()), eq(freeTrials.userId, userId)))
		.limit(1)
	if (validFreeTrial) return { validSubscriptionOrTrial: true }

	// Check subscriptions table if it was skipped the first time
	const validSubscription = await checkActiveSubscription(userId)
	if (validSubscription) return { validSubscriptionOrTrial: true }

	return { validSubscriptionOrTrial: false }
}
