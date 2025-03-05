import { relations } from 'drizzle-orm'
import { boolean, integer, pgEnum, pgTable, primaryKey, serial, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
	id: serial('id').primaryKey(),
	firstName: text('first_name').notNull(),
	lastName: text('last_name').notNull(),
	email: text('email').notNull().unique(),
	businessName: text('business_name').notNull().unique(),
	slug: text('slug').notNull().unique(),
	hashedPassword: text('hashed_password').notNull(),
	emailConfirmed: boolean('email_confirmed').notNull().default(false),
	cachedTrialExpired: boolean('cached_trial_expired').notNull().default(false),
})

export const relationships = pgTable(
	'relationships',
	{
		merchantId: integer('merchant_id')
			.notNull()
			.references(() => users.id),
		customerId: integer('customer_id')
			.notNull()
			.references(() => users.id),
	},
	(table) => [primaryKey({ columns: [table.merchantId, table.customerId] })],
)

export const invitations = pgTable(
	'invitations',
	{
		id: serial('id').primaryKey(),
		email: text('email').notNull(),
		senderUserId: integer('sender_user_id')
			.notNull()
			.references(() => users.id),
		token: uuid('token').notNull().unique().defaultRandom(),
		usedAt: timestamp('used_at'),
		expiresAt: timestamp('expires_at').notNull(),
		emailAttempts: integer('email_attempts').notNull().default(0),
		lastEmailSent: timestamp('last_email_sent').notNull(),
	},
	(table) => [uniqueIndex('sender_email_unique_idx').on(table.senderUserId, table.email)],
)

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
	userId: integer('user_id')
		.notNull()
		.references(() => users.id)
		.unique(),
	startDate: timestamp('start_date').notNull(),
	endDate: timestamp('end_date').notNull(),
})

// Optimisation ToDo: Keep track of cancelled subscriptions
export const subscriptions = pgTable('subscriptions', {
	id: serial('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id)
		.unique(),
	stripeCustomerId: text('stripe_customer_id').notNull(),
	currentPeriodStart: timestamp('current_period_start').notNull(),
	currentPeriodEnd: timestamp('current_period_end').notNull(),
	cancelledAt: timestamp('cancelled_at'),
})

// ToDo: create index on deletedAt
// Enhancement ToDo: add cutoff date to expire products
export const products = pgTable('products', {
	id: serial('id').primaryKey(),
	ownerId: integer('owner_id')
		.notNull()
		.references(() => users.id),
	name: text('name').notNull(),
	description: text('description'),
	priceInMinorUnits: integer('price_in_minor_units').notNull(),
	customVat: integer('custom_vat'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
	deletedAt: timestamp('deleted_at'),
})

export const testEmailInbox = pgTable('test_email_inbox', {
	id: serial('id').primaryKey(),
	content: text('content').notNull(),
})

export type OrderStatus = 'pending' | 'completed' | 'cancelled'
export const orderStatusEnum = pgEnum('order_status', ['pending', 'completed', 'cancelled'])

export const orders = pgTable('orders', {
	id: serial('id').primaryKey(),
	customerId: integer('customer_id')
		.notNull()
		.references(() => users.id),
	merchantId: integer('merchant_id')
		.notNull()
		.references(() => users.id),
	status: orderStatusEnum('status').notNull().default('pending'),
	requestedDeliveryDate: timestamp('requested_delivery_date').notNull(),
	adminOnlyNote: text('admin_only_note'),
	customerNote: text('customer_note'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const orderItems = pgTable('order_items', {
	id: serial('id').primaryKey(),
	orderId: integer('order_id')
		.notNull()
		.references(() => orders.id),
	productId: integer('product_id').notNull(),
	quantity: integer('quantity').notNull(),
	priceInMinorUnitsWithoutVat: integer('price_in_minor_units_without_vat').notNull(),
	vat: integer('vat').notNull(),
})

export const ordersRelations = relations(orders, ({ many }) => ({
	items: many(orderItems),
}))

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id],
	}),
}))
