import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  businessName: text('business_name').notNull().unique(),
  hashedPassword: text('hashed_password').notNull(),
  emailConfirmed: integer('email_confirmed', { mode: 'boolean' }).notNull().default(false),
})

export const merchantProfiles = sqliteTable('merchant_profiles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  slug: text('slug').notNull().unique(),
  stripeCustomerId: text('stripe_customer_id'),
})

export const customerToMerchant = sqliteTable(
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

export const invitations = sqliteTable('invitations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  merchantProfileId: integer('merchant_profile_id')
    .notNull()
    .references(() => merchantProfiles.id),
  token: text('token').notNull().unique(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  emailAttempts: integer('email_attempts').notNull().default(0),
  lastEmailSent: integer('last_email_sent', { mode: 'timestamp' }).notNull(),
})

export const confirmationTokens = sqliteTable('confirmation_tokens', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  token: text('token').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  usedAt: integer('used_at', { mode: 'timestamp' }),
})

export const freeTrials = sqliteTable('free_trials', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  merchantProfileId: integer('merchant_profile_id')
    .notNull()
    .references(() => merchantProfiles.id)
    .unique(),
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }).notNull(),
})

export const subscriptions = sqliteTable('subscriptions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  merchantProfileId: integer('merchant_profile_id')
    .notNull()
    .references(() => merchantProfiles.id),
  stripeSubscriptionId: text('stripe_subscription_id').notNull().unique(),
  priceId: text('price_id').notNull(),
  currentPeriodStart: integer('current_period_start', { mode: 'timestamp' }).notNull(),
  currentPeriodEnd: integer('current_period_end', { mode: 'timestamp' }).notNull(),
  cancelledAt: integer('cancelled_at', { mode: 'timestamp' }),
})

// products
// orders
// order_items
