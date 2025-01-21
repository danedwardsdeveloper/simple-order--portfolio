// cspell:disable-next-line
const hashed_securePassword = '$2a$10$1swWbPYeNij7jva7mg/GxOc3DtNF.55AsbljPlzf.4yQKMoHaEYJC'

export interface User {
  firstName: string
  lastName: string
  email: string
  hashedPassword: string
  emailConfirmed: boolean
  businessNameAsCustomer?: string
  role: 'merchant' | 'customer' | 'both'
  merchantProfile?: MerchantProfile
  customers?: { [customerId: string]: CustomerProfile }
}

export interface MerchantProfile {
  businessName: string
  slug: string
  subscriptionActive: boolean
}

// ToDo. I'm not sure this all this is necessary...
export interface CustomerProfile {
  firstName: string
  email: string
  emailConfirmed: boolean
  businessName?: string
}

export const merchantOnly: User = {
  firstName: 'Jane',
  lastName: 'Boodles',
  email: 'merchant@gmail.com',
  hashedPassword: hashed_securePassword,
  role: 'merchant',
  merchantProfile: {
    businessName: "Jane's Bakery",
    slug: 'janes-bakery',
    subscriptionActive: true,
  },
  emailConfirmed: false,
}

export const customerOnlyOne: User = {
  firstName: 'Jason',
  lastName: 'Smith',
  email: 'customerOne@gmail.com',
  hashedPassword: hashed_securePassword,
  emailConfirmed: false,
  role: 'customer',
  businessNameAsCustomer: "Jason's Wine Bar",
}

export const customerOnlyTwo: User = {
  firstName: 'Customer',
  lastName: 'Two',
  email: 'customerTwo@gmail.com',
  hashedPassword: hashed_securePassword,
  emailConfirmed: false,
  role: 'customer',
  businessNameAsCustomer: "Martin's Jazz Bar",
}

export const merchantAndCustomer: User = {
  firstName: 'Jasmine',
  lastName: 'Barton',
  email: 'both@gmail.com',
  hashedPassword: hashed_securePassword,
  emailConfirmed: false,
  role: 'both',
  businessNameAsCustomer: 'Kingston Lacy',
  merchantProfile: {
    businessName: 'Kingston Lacy',
    slug: 'kingston-lacy',
    subscriptionActive: true,
  },
  customers: {
    customer1: {
      firstName: customerOnlyOne.firstName,
      email: customerOnlyOne.email,
      emailConfirmed: true,
      businessName: customerOnlyOne.businessNameAsCustomer,
    },
    customer2: {
      firstName: customerOnlyTwo.firstName,
      email: customerOnlyTwo.email,
      emailConfirmed: false,
      businessName: customerOnlyTwo.businessNameAsCustomer,
    },
  },
}

export const users: { [key: string]: User[] } = {
  merchants: [merchantOnly, merchantAndCustomer],
  customers: [customerOnlyOne, customerOnlyTwo],
  both: [merchantOnly, customerOnlyOne, customerOnlyTwo, merchantAndCustomer],
}

export function findUserByEmail(email: string): User | null {
  return users.both.find(user => user.email === email) ?? null
}
