import type { orderItems, orders } from '@/library/database/schema'

export type Order = typeof orders.$inferSelect
export type OrderInsertValues = typeof orders.$inferInsert

export type OrderItem = typeof orderItems.$inferSelect
export type OrderItemInsertValues = typeof orderItems.$inferInsert

// This repeats the values from orderStatusEnum but I can't see any other way to get the values
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled'
