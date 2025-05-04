import { z } from 'zod'

// Do not export from the barrel, or will cause a treeshaking issue that breaks Drizzle studio
export const MinutesSchema = z.number().int().min(0).max(59)
export const HoursSchema = z.number().int().min(0).max(23)
