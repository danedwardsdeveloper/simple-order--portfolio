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
    accepted: integer('accepted', { mode: 'boolean' }).notNull().default(false),
    emailAttempts: integer('email_attempts').notNull().default(0),
    lastEmailSent: integer('last_email_sent', { mode: 'timestamp' }).notNull(),
  },
  table => [primaryKey({ columns: [table.merchantProfileId, table.customerProfileId] })],
)

export const freeTrials = sqliteTable('free_trials', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  merchantProfileId: integer('merchant_profile_id')
    .notNull()
    .references(() => merchantProfiles.id),
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }).notNull(),
})

// subscriptions
// products
