export interface User {
  firstName: string
  lastName: string
  email: string
  password: string
  emailConfirmed: boolean
  businessNameAsCustomer?: string
  // role: 'merchant' | 'customer' | 'both'
  merchantProfile?: MerchantProfile
  customers?: { [customerId: string]: CustomerRecord }
}

export interface MerchantProfile {
  businessName: string
  slug: string
  subscriptionActive: boolean
}

export interface CustomerRecord {
  firstName: string
  email: string
  emailConfirmed: boolean
  businessName?: string
}

export const pureMerchants: { [key: string]: User } = {
  merchant1: {
    firstName: 'Jane',
    lastName: 'Boodles',
    email: 'jane@janesbakery.co.uk',
    password: 'securePassword',
    merchantProfile: {
      businessName: "Jane's Bakery",
      slug: 'janes-bakery',
      subscriptionActive: true,
    },
    emailConfirmed: false,
  },
}

export const pureCustomers: { [key: string]: User } = {
  customer1: {
    firstName: 'Jason',
    lastName: 'Ollibolingay',
    email: 'jason@grand-hotel-salisbury.com',
    password: 'securePassword',
    emailConfirmed: false,
  },
}

export const merchantAndCustomer: { [key: string]: User } = {
  jasmine: {
    firstName: 'Jasmine',
    lastName: 'Barton',
    email: 'jasmine@kingstonlacy.co.uk',
    password: 'securePassword',
    emailConfirmed: false,
    businessNameAsCustomer: 'Kingston Lacy',
    merchantProfile: {
      businessName: 'Kingston Lacy',
      slug: 'kingston-lacy',
      subscriptionActive: true,
    },
    customers: {
      customer1: {
        firstName: pureCustomers.customer1.firstName,
        email: pureCustomers.customer1.email,
        emailConfirmed: true,
      },
      customer2: {
        firstName: 'Gerald',
        email: 'gerald@gmail.com',
        emailConfirmed: false,
        businessName: `Gerald's Sex Shop`,
      },
    },
  },
}

export const allMerchants = { ...pureMerchants, ...merchantAndCustomer }
export const allUsers: { [key: string]: User } = {
  ...pureMerchants,
  ...pureCustomers,
  ...merchantAndCustomer,
}

export const activeUser = merchantAndCustomer
