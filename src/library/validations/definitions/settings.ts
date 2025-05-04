import { z } from 'zod'

export const settingsSchema = z.object({
	cutOffTime: z.string().transform((str) => new Date(str)),
	leadTimeDays: z.number().int('Lead time must be a whole number').nonnegative('Lead time cannot be negative').default(0),
})

export const cutoffSettingsFormSchema = z.object({
	cutOffTime: z
		.string()
		.transform((str) => (str ? new Date(`1970-01-01T${str}:00`) : null))
		.optional()
		.nullable(),
	leadTimeDays: z.coerce.number().int('Must be a whole number').nonnegative('Cannot be negative').default(0).optional().nullable(),
})

export type Settings = z.infer<typeof settingsSchema>
export type SettingsForm = z.infer<typeof cutoffSettingsFormSchema>
