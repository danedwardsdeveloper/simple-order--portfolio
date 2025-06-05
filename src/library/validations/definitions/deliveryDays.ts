import { z } from 'zod'

const dayIndexValidator = z
	.number()
	.int('Day index must be a whole number')
	.min(1, 'Day index must be between 1 and 7')
	.max(7, 'Day index must be between 1 and 7')

export const acceptedDeliveryDaysValidator = z.array(dayIndexValidator)

export const deliveryDaysSchema = z.object({
	updatedWeekDayIndexes: z
		.array(dayIndexValidator)
		.min(1, 'At least one delivery day must be selected')
		.refine((days) => new Set(days).size === days.length, {
			message: 'Delivery days must be unique',
		}),
})

export const acceptedDeliveryDaysFormValidator = z.array(dayIndexValidator).optional().nullable()
