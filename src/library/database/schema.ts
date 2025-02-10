import { sql } from 'drizzle-orm'
import { boolean, check, integer, pgTable, primaryKey, serial, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'

import { serviceConstraints } from '../constants/serviceConstraints'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  businessName: text('business_name').notNull().unique(),
  hashedPassword: text('hashed_password').notNull(),
  emailConfirmed: boolean('email_confirmed').notNull().default(false),
  cachedTrialExpired: boolean('cached_trial_expired').notNull().default(false),
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
  token: uuid('token').notNull().unique().defaultRandom(),
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

export const products = pgTable(
  'products',
  {
    id: serial('id').primaryKey(),
    merchantProfileId: integer('merchant_profile_id')
      .notNull()
      .references(() => merchantProfiles.id),
    name: text('name').notNull(),
    description: text('description'),
    priceInMinorUnits: integer('price_in_minor_units').notNull(),
    customVat: integer('custom_vat'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  table => [
    unique().on(table.merchantProfileId, table.name),
    check(
      'price_check',
      sql`${table.priceInMinorUnits} >= 0 AND ${table.priceInMinorUnits} <= ${sql.raw(serviceConstraints.maximumProductValueInMinorUnits.toString())}`,
    ),
    check(
      'vat_check',
      sql`${table.customVat} IS NULL OR (${table.customVat} >= 1 AND ${table.customVat} <= ${sql.raw(serviceConstraints.highestVat.toString())})`,
    ),
    check(
      'description_length',
      sql`length(${table.description}) <= ${sql.raw(serviceConstraints.maximumProductDescriptionCharacters.toString())}`,
    ),
  ],
)

export const testEmailInbox = pgTable('test_email_inbox', {
  id: integer('id').primaryKey().notNull(),
  content: text('content').notNull(),
})

// orders
// order_items
