import type { relationships, users } from '@/library/database/schema'
import type { Roles } from '@/types'

export type DangerousBaseUser = typeof users.$inferSelect
export type BaseUserInsertValues = Required<Omit<typeof users.$inferInsert, 'id' | 'cutOffTime' | 'leadTimeDays' | 'minimumSpendPence'>>
export type BaseBrowserSafeUser = Omit<DangerousBaseUser, 'id' | 'hashedPassword'>
export type BaseUserBrowserInputValues = Omit<
	BaseUserInsertValues,
	'hashedPassword' | 'emailConfirmed' | 'slug' | 'cutOffTime' | 'leadTimeDays' | 'minimumSpendPence'
> & {
	password: string
}

export type TestUserInputValues = Omit<
	BaseUserInsertValues,
	'hashedPassword' | 'slug' | 'emailConfirmed' | 'cutOffTime' | 'leadTimeDays' | 'minimumSpendPence'
> & {
	password: string
	emailConfirmed?: boolean
}

export type InvitedCustomerBrowserInputValues = Omit<BaseUserBrowserInputValues, 'email'>

export interface BrowserSafeCompositeUser extends BaseBrowserSafeUser {
	roles: Roles
	trialEnd: Date | null
	subscriptionEnd: Date | null
	subscriptionCancelled: boolean
}

export type BrowserSafeMerchantProfile = Pick<
	DangerousBaseUser,
	'slug' | 'businessName' | 'cutOffTime' | 'leadTimeDays' | 'minimumSpendPence'
>

export interface BrowserSafeCustomerProfile {
	businessName: string
	obfuscatedEmail: string
}

/**
 * Simple inferred type from Drizzle junction table where insert & return type are identical
 * @example
const newRelationship: RelationshipRecord = {
	customerId: 1,
	merchantId: 2,
}
 */
export type RelationshipRecord = typeof relationships.$inferSelect

export interface BrowserSafeInvitationSent {
	obfuscatedEmail: string
	lastEmailSentDate: Date
	expirationDate: Date
}

export interface BrowserSafeInvitationReceived {
	merchantBusinessName: string
	expirationDate: Date
}
