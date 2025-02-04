import { boolean, integer, primaryKey, serial, text, timestamp } from 'drizzle-orm/pg-core'
import { pgTable } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  businessName: text('business_name').notNull().unique(),
  hashedPassword: text('hashed_password').notNull(),
  emailConfirmed: boolean('email_confirmed').notNull().default(false),
})

export const merchantProfiles = pgTable('merchant_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  slug: text('slug').notNull().unique(),
  stripeCustomerId: text('stripe_customer_id'),
})

export const customerToMerchant = pgTable(
  'customer_to_merchant',
  {
    merchantProfileId: integer('merchant_profile_id')
      .notNull()
      .references(() => merchantProfiles.id),
    customerProfileId: integer('customer_profile_id')
      .notNull()
      .references(() => users.id),
  },
  table => [primaryKey({ columns: [table.merchantProfileId, table.customerProfileId] })],
)

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  merchantProfileId: integer('merchant_profile_id')
    .notNull()
    .references(() => merchantProfiles.id),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  emailAttempts: integer('email_attempts').notNull().default(0),
  lastEmailSent: timestamp('last_email_sent').notNull(),
})

export const confirmationTokens = pgTable('confirmation_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  token: text('token').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
})

export const freeTrials = pgTable('free_trials', {
  id: serial('id').primaryKey(),
  merchantProfileId: integer('merchant_profile_id')
    .notNull()
    .references(() => merchantProfiles.id)
    .unique(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
})

export const subscriptions = pgTable('subscriptions', {
  id: integer('id').primaryKey(),
  merchantProfileId: integer('merchant_profile_id')
    .notNull()
    .references(() => merchantProfiles.id),
  stripeSubscriptionId: text('stripe_subscription_id').notNull().unique(),
  priceId: text('price_id').notNull(),
  currentPeriodStart: timestamp('current_period_start').notNull(),
  currentPeriodEnd: timestamp('current_period_end').notNull(),
  cancelledAt: timestamp('cancelled_at'),
})

export interface Product {
  id: number
  name: string
  sku?: string
  description?: string
  priceInMinorUnits: number
  customVat?: number
}

export const temporaryProducts: Product[] = [
  {
    id: 1,
    name: 'Victoria Sponge',
    sku: 'CAKE-VS-001',
    description: 'Classic layered sponge cake filled with raspberry jam and buttercream, dusted with icing sugar',
    priceInMinorUnits: 395,
    customVat: 0,
  },
  {
    id: 2,
    name: 'Cornish Pasty',
    sku: 'SAV-CP-001',
    description: 'Traditional hand-crimped pasty filled with beef, potato, swede and onion',
    priceInMinorUnits: 450,
    customVat: 20,
  },
  {
    id: 3,
    name: 'Sourdough Loaf',
    sku: 'BRD-SD-001',
    description: '24-hour fermented sourdough made with organic flour',
    priceInMinorUnits: 425,
    customVat: 0,
  },
  {
    id: 4,
    name: 'Eccles Cakes',
    sku: 'PST-EC-001',
    description: 'Flaky pastry filled with spiced currants, pack of 4',
    priceInMinorUnits: 350,
    customVat: 0,
  },
  {
    id: 5,
    name: 'Chelsea Bun',
    sku: 'SWT-CB-001',
    description: 'Spiral sweet bun with currants, sultanas and mixed peel, topped with sticky glaze',
    priceInMinorUnits: 275,
    customVat: 0,
  },
  {
    id: 6,
    name: 'Wholemeal Bloomer',
    sku: 'BRD-WB-001',
    description: 'Traditional bloomer loaf made with stoneground wholemeal flour',
    priceInMinorUnits: 295,
    customVat: 0,
  },
  {
    id: 7,
    name: 'Sausage Roll',
    sku: 'SAV-SR-001',
    description: 'Buttery puff pastry filled with seasoned Gloucestershire pork',
    priceInMinorUnits: 325,
    customVat: 20,
  },
  {
    id: 8,
    name: 'Lemon Drizzle',
    sku: 'CAKE-LD-001',
    description: 'Light sponge cake with lemon zest, soaked in tangy lemon syrup',
    priceInMinorUnits: 350,
    customVat: 0,
  },
  {
    id: 9,
    name: 'Fruit Scones',
    sku: 'PST-SC-001',
    description: 'Light and fluffy sultana scones, pack of 2',
    priceInMinorUnits: 275,
    customVat: 0,
  },
  {
    id: 10,
    name: 'Bakewell Tart',
    sku: 'PST-BW-001',
    description: 'Sweet shortcrust pastry filled with raspberry jam, frangipane, and topped with flaked almonds',
    priceInMinorUnits: 375,
    customVat: 0,
  },
]

// orders
// order_items
