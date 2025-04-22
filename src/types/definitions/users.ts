import type { relationships, users } from '@/library/database/schema'
import type { Roles } from '@/types'

export type DangerousBaseUser = typeof users.$inferSelect
export type BaseUserInsertValues = Required<Omit<typeof users.$inferInsert, 'id'>>
export type BaseBrowserSafeUser = Omit<DangerousBaseUser, 'id' | 'hashedPassword'>
export type BaseUserBrowserInputValues = Omit<BaseUserInsertValues, 'hashedPassword' | 'cachedTrialExpired' | 'emailConfirmed' | 'slug'> & {
	password: string
}

export type TestUserInputValues = Omit<BaseUserInsertValues, 'hashedPassword' | 'slug' | 'cachedTrialExpired'> & {
	password: string
}

export type InvitedCustomerBrowserInputValues = Omit<BaseUserBrowserInputValues, 'email'>

export interface BrowserSafeCompositeUser extends BaseBrowserSafeUser {
	roles: Roles
	activeSubscriptionOrTrial: boolean
	trialExpiry?: Date
}

export interface BrowserSafeMerchantProfile {
	slug: string
	businessName: string
}

export interface BrowserSafeCustomerProfile {
	businessName: string
	obfuscatedEmail: string
}

// Junction table where insert & return type are identical
export type RelationshipJoinRow = typeof relationships.$inferSelect

export interface BrowserSafeInvitationSent {
	obfuscatedEmail: string
	lastEmailSentDate: Date
	expirationDate: Date
}

export interface BrowserSafeInvitationReceived {
	merchantBusinessName: string
	expirationDate: Date
}
