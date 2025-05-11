import { z } from 'zod'

export const holidaySchema = z
	.object({
		startDate: z
			.string()
			.transform((str) => new Date(str))
			.refine((date) => date > new Date(), {
				message: 'Start date must be in the future',
			}),
		endDate: z
			.string()
			.transform((str) => new Date(str))
			.refine((date) => date > new Date(), {
				message: 'Start date must be in the future',
			})
			.optional(),
	})
	.refine((data) => !data.endDate || data.endDate >= data.startDate, {
		message: 'End date must be after or equal to start date',
		path: ['endDate'],
	})

export const holidaysValidator = z.array(holidaySchema)

export const holidaysSchema = z.object({
	holidaysToAdd: z.array(holidaySchema),
})

export const holidaysFormValidator = z.array(holidaySchema).optional().nullable()
