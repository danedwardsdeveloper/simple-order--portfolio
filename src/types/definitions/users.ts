import type { relationships, users } from '@/library/database/schema'
import type { Roles } from '@/types'

export type DangerousBaseUser = typeof users.$inferSelect
export type BaseUserInsertValues = Required<Omit<typeof users.$inferInsert, 'id' | 'cutoffTime'>>
export type BaseBrowserSafeUser = Omit<DangerousBaseUser, 'id' | 'hashedPassword'>
export type BaseUserBrowserInputValues = Omit<BaseUserInsertValues, 'hashedPassword' | 'emailConfirmed' | 'slug'> & {
	password: string
}

export type TestUserInputValues = Omit<BaseUserInsertValues, 'hashedPassword' | 'slug' | 'emailConfirmed'> & {
	password: string
	emailConfirmed?: boolean
}

export type InvitedCustomerBrowserInputValues = Omit<BaseUserBrowserInputValues, 'email'>

/**
 * @example
const browserSafeCompositeUser: BrowserSafeCompositeUser = {
	firstName: '',
	lastName: '',
	email: '',
	businessName: '',
	slug: '',
	roles: 'merchant',
	activeSubscriptionOrTrial: false,
	emailConfirmed: false,
	trialExpiry: new Date() // optional
}
 */
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

/**
 * Simple inferred type from Drizzle junction table where insert & return type are identical
 * @example
const newRelationship: RelationshipJoinRow = {
	customerId: 1,
	merchantId: 2,
}
 */
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
