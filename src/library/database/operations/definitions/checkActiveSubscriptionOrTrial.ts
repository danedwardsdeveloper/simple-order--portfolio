import { and, eq as equals, gt as isGreaterThan } from 'drizzle-orm'

import { database } from '../../connection'
import { freeTrials, subscriptions } from '../../schema'

async function checkActiveSubscription(userId: number): Promise<boolean> {
  const [validSubscription] = await database
    .select()
    .from(subscriptions)
    .where(and(isGreaterThan(subscriptions.currentPeriodEnd, new Date()), equals(subscriptions.merchantProfileId, userId)))
    .limit(1)
  if (validSubscription) return true
  return false
}

export async function checkActiveSubscriptionOrTrial(
  userId: number,
  cachedTrialExpired: boolean = false,
): Promise<{ validSubscriptionOrTrial: boolean }> {
  if (cachedTrialExpired) {
    const validSubscription = await checkActiveSubscription(userId)
    if (validSubscription) return { validSubscriptionOrTrial: true }
  }

  const [validFreeTrial] = await database
    .select()
    .from(freeTrials)
    .where(and(isGreaterThan(freeTrials.endDate, new Date()), equals(freeTrials.merchantProfileId, userId)))
    .limit(1)
  if (validFreeTrial) return { validSubscriptionOrTrial: true }

  // Check subscriptions table if it was skipped the first time
  const validSubscription = await checkActiveSubscription(userId)
  if (validSubscription) return { validSubscriptionOrTrial: true }

  return { validSubscriptionOrTrial: false }
}
