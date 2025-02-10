import { eq, or } from 'drizzle-orm'

import { database } from '@/library/database/connection'
import {
  confirmationTokens,
  customerToMerchant,
  freeTrials,
  invitations,
  merchantProfiles,
  products,
  subscriptions,
  users,
} from '@/library/database/schema'

export async function deleteUserSequence(email: string) {
  const [testAccount] = await database.select().from(users).where(eq(users.email, email))
  if (testAccount) {
    const [merchantProfile] = await database.select().from(merchantProfiles).where(eq(merchantProfiles.userId, testAccount.id))
    if (merchantProfile) {
      await database.delete(subscriptions).where(eq(subscriptions.merchantProfileId, merchantProfile.id))
      await database.delete(products).where(eq(products.merchantProfileId, merchantProfile.id))
      await database.delete(invitations).where(eq(invitations.merchantProfileId, merchantProfile.id))
      await database.delete(freeTrials).where(eq(freeTrials.merchantProfileId, merchantProfile.id))
      await database
        .delete(customerToMerchant)
        .where(or(eq(customerToMerchant.merchantProfileId, merchantProfile.id), eq(customerToMerchant.customerProfileId, testAccount.id)))
      await database.delete(merchantProfiles).where(eq(merchantProfiles.userId, testAccount.id))
    }
    await database.delete(confirmationTokens).where(eq(confirmationTokens.userId, testAccount.id))
    await database.delete(users).where(eq(users.email, email))
  }
}
