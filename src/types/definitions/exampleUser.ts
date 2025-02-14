export const exampleUser: FullBrowserSafeUser = {
  firstName: '',
  lastName: '',
  email: '',
  businessName: '',
  emailConfirmed: false,
  merchantDetails: {
    slug: '',
    accountStatus: 'trial',
    freeTrialExpiry: new Date(),
    customers: {
      confirmed: [
        {
          businessName: `Jane's Bakery`,
          obfuscatedEmail: 'janes*****@g****.com',
        },
      ],
      pending: [
        {
          businessName: `Jane's Bakery`,
          obfuscatedEmail: 'janes*****@g****.com',
          expiry: new Date(),
        },
      ],
      expired: [
        {
          businessName: `Jane's Bakery`,
          obfuscatedEmail: 'janes*****@g****.com',
        },
      ],
    },
  },
  customerDetails: {
    merchants: [
      {
        businessName: `Jane's Bakery`,
        slug: 'janes-bakery',
      },
    ],
  },
}

interface BrowserSafeCustomerRecord {
  businessName: string
  obfuscatedEmail: string
}

interface BrowserSafePendingCustomerRecord extends BrowserSafeCustomerRecord {
  expiry: Date
}

interface BrowserSafeMerchantRecord {
  businessName: string
  slug: string
}

interface FullBrowserSafeUser {
  firstName: string
  lastName: string
  email: string
  businessName: string
  emailConfirmed: boolean
  merchantDetails?: {
    slug: string
    accountStatus: 'trial' | 'active' | 'expired'
    freeTrialExpiry: Date
    customers: {
      confirmed: BrowserSafeCustomerRecord[]
      pending: BrowserSafePendingCustomerRecord[]
      expired: BrowserSafeCustomerRecord[]
    }
  }
  customerDetails?: {
    merchants: BrowserSafeMerchantRecord[]
  }
}
