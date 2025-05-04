import type { HoursSchema, MinutesSchema } from '@/library/validations/definitions/time'
import type { z } from 'zod'

export type Minutes = z.infer<typeof MinutesSchema>
export type Hours = z.infer<typeof HoursSchema>
export type Month = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11

// Blog publication years
export type Year = 2025 | 2026 | 2027
