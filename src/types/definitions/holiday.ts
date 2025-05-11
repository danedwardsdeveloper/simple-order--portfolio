import type { holidays } from '@/library/database/schema'

export type HolidayInsert = typeof holidays.$inferInsert
