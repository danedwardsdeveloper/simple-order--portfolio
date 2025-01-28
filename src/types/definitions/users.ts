import { customerToMerchant, merchantProfiles, users } from '@/library/database/schema'

export type User = typeof users.$inferSelect
export type NewUser = Required<Omit<typeof users.$inferInsert, 'id'>>

export type MerchantProfile = typeof merchantProfiles.$inferSelect
export type NewMerchantProfile = typeof merchantProfiles.$inferInsert

export type customerToMerchant = typeof customerToMerchant.$inferSelect
export type NewCustomerToMerchant = typeof customerToMerchant.$inferInsert

export type SafeUser = Omit<User, 'hashedPassword'>

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

export const exampleClientUserObject: ClientSafeUser = {
  id: 10,
  firstName: 'name',
  lastName: 'lastName',
  email: 'mybusiness@gmail.com',
  businessName: 'My Business',
  emailConfirmed: false,
  merchantDetails: {
    slug: 'my-business',
    freeTrial: {
      endDate: new Date('2025-01-28T09:59:35.000Z'),
    },
    customersAsMerchant: [],
  },
  merchantsAsCustomer: [],
}

export const currentResponse = {
  message: 'success',
  safeNewUser: {
    id: 10,
    firstName: 'name',
    lastName: 'lastName',
    email: 'wedrfgs@gmail.com',
    businessName: 'My Business',
    emailConfirmed: false,
  },
  newMerchant: { id: 10, userId: 10, slug: 'my-business' },
  newFreeTrial: {
    id: 10,
    merchantProfileId: 10,
    startDate: '2025-01-28T09:59:35.000Z',
    endDate: '2025-01-28T09:59:35.000Z',
  },
}
