import { customerToMerchant, merchantProfiles, users } from '@/library/database/schema'

import { ClientProduct } from './products'

// Rename this DangerousBaseUser
export type BaseUser = typeof users.$inferSelect
export type NewBaseUser = Required<Omit<typeof users.$inferInsert, 'id'>>
export type BaseUserWithoutPassword = Omit<BaseUser, 'hashedPassword'>
export type ClientSafeBaseUser = Omit<BaseUserWithoutPassword, 'id'>

export type MerchantProfile = typeof merchantProfiles.$inferSelect
export type NewMerchantProfile = typeof merchantProfiles.$inferInsert
export type ClientSafeMerchantProfile = Pick<MerchantProfile, 'slug'>

export type CustomerToMerchant = typeof customerToMerchant.$inferSelect
export type NewCustomerToMerchant = typeof customerToMerchant.$inferInsert

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

// Change to FullBrowserSafeUser
export interface FullClientSafeUser {
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
