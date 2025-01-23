import { Roles } from '@/types'

// cspell:disable-next-line
const temporaryHashedSecurePassword = '$2a$10$1swWbPYeNij7jva7mg/GxOc3DtNF.55AsbljPlzf.4yQKMoHaEYJC'

export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  hashedPassword: string
  emailConfirmed: boolean
  businessNameAsCustomer?: string
  role: Roles
  merchantProfile?: MerchantProfile
  subscriptionStatus: 'paid' | 'trial' | 'customer only' | 'expired'
  customerIds?: number[]
  merchantIds?: number[]
  lastUsedModeWasMerchant?: boolean
}

export type SafeUser = Omit<User, 'hashedPassword'>

export interface MerchantProfile {
  businessName: string
  slug: string
}

export interface CustomerProfile {
  firstName: string
  email: string
  emailConfirmed: boolean
  businessName?: string
}

export const merchantOnlyOne: User = {
  id: 1,
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'merchant@gmail.com',
  hashedPassword: temporaryHashedSecurePassword,
  role: 'merchant',
  merchantProfile: {
    businessName: "Jane's Bakery",
    slug: 'janes-bakery',
  },
  subscriptionStatus: 'trial',
  emailConfirmed: false,
  customerIds: [2, 3, 4],
}

export const merchantOnlyTwo: User = {
  id: 5,
  firstName: 'Steve',
  lastName: 'Philips',
  email: 'merchantTwo@gmail.com',
  hashedPassword: temporaryHashedSecurePassword,
  role: 'merchant',
  merchantProfile: {
    businessName: "Steve's Dairy",
    slug: 'steves-dairy',
  },
  subscriptionStatus: 'trial',
  emailConfirmed: true,
  customerIds: [2, 3, 4],
}

export const customerOnlyOne: User = {
  id: 2,
  firstName: 'Jason',
  lastName: 'Smith',
  email: 'customerOne@gmail.com',
  hashedPassword: temporaryHashedSecurePassword,
  emailConfirmed: false,
  role: 'customer',
  businessNameAsCustomer: "Jason's Wine Bar",
  subscriptionStatus: 'customer only',
  merchantIds: [1, 5],
}

export const customerOnlyTwo: User = {
  id: 3,
  firstName: 'Customer',
  lastName: 'Two',
  email: 'customerTwo@gmail.com',
  hashedPassword: temporaryHashedSecurePassword,
  emailConfirmed: false,
  role: 'customer',
  businessNameAsCustomer: "Martin's Jazz Bar",
  subscriptionStatus: 'customer only',
}

export const merchantAndCustomer: User = {
  id: 4,
  firstName: 'Jasmine',
  lastName: 'Barton',
  email: 'both@gmail.com',
  hashedPassword: temporaryHashedSecurePassword,
  emailConfirmed: false,
  role: 'both',
  businessNameAsCustomer: 'Kingston Lacy',
  subscriptionStatus: 'paid',
  merchantProfile: {
    businessName: 'Kingston Lacy',
    slug: 'kingston-lacy',
  },
  merchantIds: [merchantOnlyOne.id, merchantOnlyTwo.id],
  customerIds: [customerOnlyOne.id, customerOnlyTwo.id],
}

export const users: { [key: string]: User[] } = {
  merchants: [merchantOnlyOne, merchantOnlyTwo, merchantAndCustomer],
  customers: [customerOnlyOne, customerOnlyTwo],
  all: [merchantOnlyOne, merchantOnlyTwo, customerOnlyOne, customerOnlyTwo, merchantAndCustomer],
}

export function findUserByEmail(email: string): User | null {
  return users.all.find(user => user.email === email) ?? null
}

export function findUserById(id: number): User | null {
  return users.all.find(user => user.id === id) ?? null
}

export const createSafeUser = (user: User): SafeUser => {
  const { hashedPassword, ...safeUser } = user
  return safeUser
}
