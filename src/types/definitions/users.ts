import { customerToMerchant, merchantProfiles, users } from '@/library/database/schema'

import { ClientProduct } from './products'

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

export interface ClientMerchantDetails {
  slug: string
  freeTrial: {
    endDate: Date
  }
  customersAsMerchant: RelationshipItem[]
}

// Rename this FullClientSafeUser
export interface FullClientSafeUser {
  firstName: string
  lastName: string
  email: string
  businessName: string
  emailConfirmed: boolean
  merchantDetails?: ClientMerchantDetails
  merchantsAsCustomer?: RelationshipItem[]
  inventory?: ClientProduct[]
}
