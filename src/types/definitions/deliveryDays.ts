import type { daysOfWeek } from '@/library/database/schema'
import type { holidaySchema } from '@/library/validations'
import type { z } from 'zod'

export type DayOfTheWeek = Omit<typeof daysOfWeek.$inferSelect, 'id'>

export type Holiday = z.infer<typeof holidaySchema>
