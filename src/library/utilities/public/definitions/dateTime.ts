import { durationSettings } from '@/library/constants'
import { HoursSchema, MinutesSchema, createCutOffTime } from '@/library/shared'
import { z } from 'zod'

export function invitationExpiryDate() {
	return new Date(Date.now() + durationSettings.acceptInvitationExpiry)
}

export function epochDateToTimeInput(epochDate: Date) {
	const date = new Date(epochDate)
	const hours = date.getUTCHours().toString().padStart(2, '0')
	const minutes = date.getUTCMinutes().toString().padStart(2, '0')
	return `${hours}:${minutes}`
}

export function epochDateToAmPm(epochDate: Date): string {
	const date = new Date(epochDate)
	const hours = date.getUTCHours()
	const minutes = date.getUTCMinutes().toString().padStart(2, '0')
	const period = hours >= 12 ? 'pm' : 'am'
	const displayHours = hours % 12 || 12
	return `${displayHours}:${minutes}${period}`
}

const TimeInputSchema = z.string().regex(
	/^\d{1,2}:\d{2}$/, //
	"Time must be in format 'HH:MM'",
)

export function timeInputToEpochDate(timeInputValue: string): Date {
	TimeInputSchema.parse(timeInputValue)
	const [hours, minutes] = timeInputValue.split(':').map(Number)

	HoursSchema.parse(hours)
	MinutesSchema.parse(minutes)

	return createCutOffTime({ minutes, hours })
}
