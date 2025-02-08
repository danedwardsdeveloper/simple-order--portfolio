import { eq as equals } from 'drizzle-orm'

import { merchantProfiles, products, users } from '@/library/database/schema'

import { database } from '../connection'
import { BaseUser, ClientProduct } from '@/types'

export async function checkUser(
  userId: number,
): Promise<{ userExists: boolean; emailConfirmed: boolean; cachedTrialExpired: boolean; businessName: string }> {
  const [existingUser]: BaseUser[] = await database.select().from(users).where(equals(users.id, userId)).limit(1)

  existingUser.cachedTrialExpired
  return {
    userExists: !!existingUser,
    emailConfirmed: !!existingUser?.emailConfirmed,
    cachedTrialExpired: !!existingUser?.cachedTrialExpired,
    businessName: existingUser.businessName,
  }
}

export async function checkMerchantProfile(userId: number): Promise<{ merchantProfileExists: boolean; slug: string }> {
  const [merchantProfile] = await database
    .select({ slug: merchantProfiles.slug })
    .from(merchantProfiles)
    .where(equals(merchantProfiles.userId, userId))
    .limit(1)

  return { merchantProfileExists: !!merchantProfile, slug: merchantProfile.slug }
}

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
    .where(equals(products.merchantProfileId, userId))
  return inventory
}
