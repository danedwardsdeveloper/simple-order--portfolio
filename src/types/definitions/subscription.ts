import type { subscriptions } from '@/library/database/schema'

export type Subscription = typeof subscriptions.$inferSelect
export type SubscriptionInsertValues = typeof subscriptions.$inferInsert
