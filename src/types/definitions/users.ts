import { customerToMerchant, merchantProfiles, users } from '@/library/database/schema'

import { ClientProduct } from './products'

export type DangerousBaseUser = typeof users.$inferSelect
export type BaseUserInsertValues = Required<Omit<typeof users.$inferInsert, 'id'>>
export type BaseBrowserSafeUser = Omit<DangerousBaseUser, 'id' | 'hashedPassword'>
export type BaseUserBrowserInputValues = Omit<BaseUserInsertValues, 'hashedPassword' | 'cachedTrialExpired' | 'emailConfirmed'> & {
  password: string
  staySignedIn: boolean
}
export type InvitedCustomerBrowserInputValues = Omit<BaseUserBrowserInputValues, 'email'>

export type MerchantProfile = typeof merchantProfiles.$inferSelect
export type MerchantProfileInsertValues = typeof merchantProfiles.$inferInsert
export type BrowserSafeMerchantProfile = Pick<MerchantProfile, 'slug'>

// Junction table where insert & return type are identical
export type CustomerToMerchant = typeof customerToMerchant.$inferSelect

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
  expirationDate: Date
}

export interface FullBrowserSafeUser {
  firstName: string
  lastName: string
  email: string
  businessName: string
  emailConfirmed: boolean
  merchantDetails?: ClientMerchantDetails
  merchantsAsCustomer?: RelationshipItem[]
  inventory?: ClientProduct[]
  acceptedCustomersAsMerchant?: RelationshipItem[]
  pendingCustomersAsMerchant?: BrowserSafeInvitationRecord[]
}
