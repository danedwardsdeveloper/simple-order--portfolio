import { defaultCutOffTime, defaultLeadTimeDays, searchParamNames } from '@/library/constants'
import { relations } from 'drizzle-orm'
import { boolean, date, integer, pgTable, primaryKey, serial, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'
import { defaultMinimumSpendPence } from '../constants/definitions/minimumSpend'

export const users = pgTable('users', {
	id: serial('id').primaryKey(),
	firstName: text('first_name').notNull(),
	lastName: text('last_name').notNull(),
	email: text('email').notNull().unique(),
	businessName: text('business_name').notNull().unique(),
	slug: text('slug').notNull().unique(),
	hashedPassword: text('hashed_password').notNull(),
	emailConfirmed: boolean('email_confirmed').notNull().default(false),
	cutOffTime: timestamp('cut_off_time', { withTimezone: false, precision: 0, mode: 'date' }).default(defaultCutOffTime).notNull(),
	leadTimeDays: integer('lead_time_days').default(defaultLeadTimeDays).notNull(),
	minimumSpendPence: integer('minimum_spend_pence').default(defaultMinimumSpendPence).notNull(),
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
		email: text('email').notNull(), // Rename this recipientEmail. I've been confused about this several times but it seems obvious after.
		senderUserId: integer('sender_user_id')
			.notNull()
			.references(() => users.id),
		token: uuid(searchParamNames.emailConfirmationToken).notNull().unique().defaultRandom(),
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
	token: text(searchParamNames.emailConfirmationToken).notNull(),
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

	// ToDo: Change this to just vat
	customVat: integer('custom_vat').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
	deletedAt: timestamp('deleted_at'),
})

export const testEmailInbox = pgTable('test_email_inbox', {
	id: serial('id').primaryKey(),
	recipientEmail: text('recipient_email').notNull(),
	content: text('content').notNull(),
})

export const orders = pgTable('orders', {
	id: serial('id').primaryKey(),
	customerId: integer('customer_id')
		.notNull()
		.references(() => users.id),
	merchantId: integer('merchant_id')
		.notNull()
		.references(() => users.id),
	statusId: integer('status_id')
		.notNull()
		.references(() => orderStatuses.id),
	requestedDeliveryDate: timestamp('requested_delivery_date').notNull(),
	adminOnlyNote: text('admin_only_note'),
	customerNote: text('customer_note'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const orderStatuses = pgTable('order_statuses', {
	id: serial('id').primaryKey(),
	name: text('name').notNull().unique(),
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

export const daysOfWeek = pgTable('days_of_week', {
	id: serial('id').primaryKey(),
	name: text('name').notNull().unique(),
	sortOrder: integer('sort_order').notNull(),
})

export const acceptedDeliveryDays = pgTable(
	'accepted_delivery_days',
	{
		userId: integer('user_id')
			.references(() => users.id)
			.notNull(),
		dayOfWeekId: integer('day_of_week_id')
			.references(() => daysOfWeek.id)
			.notNull(),
	},
	(table) => {
		return [primaryKey({ columns: [table.userId, table.dayOfWeekId] })]
	},
)

export const deliveryDaysRelations = relations(acceptedDeliveryDays, ({ one }) => ({
	user: one(users, {
		fields: [acceptedDeliveryDays.userId],
		references: [users.id],
	}),
	dayOfWeek: one(daysOfWeek, {
		fields: [acceptedDeliveryDays.dayOfWeekId],
		references: [daysOfWeek.id],
	}),
}))

export const holidays = pgTable('holidays', {
	id: serial('id').primaryKey(),
	userId: integer('user_id')
		.references(() => users.id)
		.notNull(),
	startDate: date('start_date', { mode: 'date' }).notNull(),
	endDate: date('end_date', { mode: 'date' }).notNull(),
})

export const holidaysRelations = relations(holidays, ({ one }) => ({
	user: one(users, {
		fields: [holidays.userId],
		references: [users.id],
	}),
}))

export const contactFormSubmissions = pgTable('contact_form_submissions', {
	id: serial('id').primaryKey(),
	firstName: text('first_name').notNull(),
	businessName: text('business_name').notNull(),
	email: text('email').notNull(),
	message: text('message').notNull(),
	website: text('website'), // Honeypot
	createdAt: timestamp('created_at').defaultNow().notNull(),
})

// analytics_event
// analytics_type - pdf_download
