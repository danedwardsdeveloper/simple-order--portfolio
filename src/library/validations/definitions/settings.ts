import { z } from 'zod'
import { acceptedDeliveryDaysFormValidator } from './deliveryDays'
import { holidaysFormValidator } from './holidays'

const wholeNumberValidator = z.number().int('Must be a whole number').nonnegative('Cannot be negative')

export const cutOffTimeValidator = z.string().transform((str) => new Date(str))
export const leadTimeDaysValidator = wholeNumberValidator.describe('Lead time must be a whole number and cannot be negative')
export const minimumSpendValidator = wholeNumberValidator.describe('Minimum spend must be a whole number and cannot be negative')

export const settingsSchema = z
	.object({
		cutOffTime: cutOffTimeValidator.optional(),
		leadTimeDays: leadTimeDaysValidator.optional(),
		minimumSpendPence: minimumSpendValidator.optional(),
	})
	.refine(
		(data) => {
			return Object.keys(data).length > 0
		},
		{
			message: 'At least one setting must be provided',
		},
	)

export const cutOffTimeFormValidator = z
	.string()
	.transform((str) => (str ? new Date(`1970-01-01T${str}:00`) : null))
	.optional()
	.nullable()

export const leadTimeDaysFormValidator = z.coerce
	.number()
	.int('Must be a whole number')
	.nonnegative('Cannot be negative')
	.optional()
	.nullable()

export const minimumSpendFormValidator = z.coerce
	.number()
	.int('Must be a whole number')
	.nonnegative('Cannot be negative')
	.optional()
	.nullable()

export const settingsFormSchema = z.object({
	cutOffTime: cutOffTimeFormValidator,
	leadTimeDays: leadTimeDaysFormValidator,
	minimumSpendPence: minimumSpendFormValidator,
	acceptedDeliveryDays: acceptedDeliveryDaysFormValidator,
	holidays: holidaysFormValidator,
})

export type SettingsForm = z.infer<typeof settingsFormSchema>
