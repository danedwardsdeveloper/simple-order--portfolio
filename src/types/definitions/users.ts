import type { relationships, users } from '@/library/database/schema'
import type { Roles } from '@/types'

export type DangerousBaseUser = typeof users.$inferSelect
export type BaseUserInsertValues = Required<Omit<typeof users.$inferInsert, 'id'>>
export type BaseBrowserSafeUser = Omit<DangerousBaseUser, 'id' | 'hashedPassword'>
export type BaseUserBrowserInputValues = Omit<BaseUserInsertValues, 'hashedPassword' | 'cachedTrialExpired' | 'emailConfirmed'> & {
	password: string
}
export type InvitedCustomerBrowserInputValues = Omit<BaseUserBrowserInputValues, 'email'>

export interface BrowserSafeCompositeUser extends BaseBrowserSafeUser {
	roles: Roles
	activeSubscriptionOrTrial: boolean
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

// ToDo: Think of a better name
export interface BrowserSafeInvitationSent {
	obfuscatedEmail: string
	lastEmailSentDate: Date
	expirationDate: Date
}

// ToDo: Think of a better name
export interface BrowserSafeInvitationReceived {
	merchantBusinessName: string
	expirationDate: Date
}
