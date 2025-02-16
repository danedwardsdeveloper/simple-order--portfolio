import type { subscriptions } from '@/library/database/schema'

export type Subscription = typeof subscriptions.$inferSelect
export type NewSubscription = typeof subscriptions.$inferInsert
