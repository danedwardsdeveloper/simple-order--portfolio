import type { daysOfWeek, holidays } from '@/library/database/schema'

export type DayOfTheWeek = Omit<typeof daysOfWeek.$inferSelect, 'id'>
export type Holiday = Omit<typeof holidays.$inferSelect, 'id' | 'userId'>
