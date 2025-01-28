import { customerToMerchant, merchantProfiles, users } from '@/library/database/schema'

export type User = typeof users.$inferSelect
export type NewUser = Required<Omit<typeof users.$inferInsert, 'id'>>
export type SafeUser = Omit<User, 'hashedPassword'>

export type MerchantProfile = typeof merchantProfiles.$inferSelect
export type NewMerchantProfile = typeof merchantProfiles.$inferInsert

export type customerToMerchant = typeof customerToMerchant.$inferSelect
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

export interface ClientSafeUser {
  id: number
  firstName: string
  lastName: string
  email: string
  businessName: string
  emailConfirmed: boolean
  merchantDetails?: ClientMerchantDetails
  merchantsAsCustomer?: RelationshipItem[]
}
