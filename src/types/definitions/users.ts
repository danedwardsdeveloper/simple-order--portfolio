import type { merchantProfiles, relationships, users } from '@/library/database/schema'
import type { Roles } from '@/types'

export type DangerousBaseUser = typeof users.$inferSelect
export type BaseUserInsertValues = Required<Omit<typeof users.$inferInsert, 'id'>>
export type BaseBrowserSafeUser = Omit<DangerousBaseUser, 'id' | 'hashedPassword'>
export type BaseUserBrowserInputValues = Omit<BaseUserInsertValues, 'hashedPassword' | 'cachedTrialExpired' | 'emailConfirmed'> & {
	password: string
	staySignedIn: boolean
}
export interface BrowserSafeCompositeUser extends BaseBrowserSafeUser {
	roles: Roles
	accountActive: boolean
}

export type InvitedCustomerBrowserInputValues = Omit<BaseUserBrowserInputValues, 'email'>

export type DangerousMerchantProfile = typeof merchantProfiles.$inferSelect
export type MerchantProfileInsertValues = typeof merchantProfiles.$inferInsert
export interface BrowserSafeMerchantProfile {
	slug: string
	businessName: string
}

// Junction table where insert & return type are identical
export type RelationshipJoinRow = typeof relationships.$inferSelect

export interface RelationshipItem {
	id: number
	businessName: string
}

// Change to BrowserMerchantDetails
export interface ClientMerchantDetails {
	slug: string
	// This needs work...
	freeTrial: {
		endDate: Date
	}
	customersAsMerchant: RelationshipItem[]
}

export interface BrowserSafeInvitationRecord {
	obfuscatedEmail: string
	lastEmailSentDate: Date
	expirationDate: Date
}

export interface BrowserSafeCustomerProfile {
	businessName: string
	obfuscatedEmail: string
}
