import { differenceInDays, isAfter } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { createFreeTrialEndTime } from '.'

const testIsFutureDate = (trialEnd: Date) => {
	const now = new Date()
	expect(isAfter(trialEnd, now)).toBe(true)
	expect(trialEnd).toBeInstanceOf(Date)
}

function testIsAtLeast30Days(trialEnd: Date) {
	const now = new Date()
	const daysDifference = differenceInDays(trialEnd, now)
	expect(daysDifference).toBeGreaterThanOrEqual(30)
}

function testEndsBeforeMidnightUK(trialEnd: Date) {
	const hours = Number(formatInTimeZone(trialEnd, 'Europe/London', 'HH'))
	const minutes = Number(formatInTimeZone(trialEnd, 'Europe/London', 'mm'))
	const seconds = Number(formatInTimeZone(trialEnd, 'Europe/London', 'ss'))

	expect(hours).toBe(23)
	expect(minutes).toBe(59)
	expect(seconds).toBe(59)
}

describe('createFreeTrialEndTime', () => {
	test('Should be in the future and be a date', () => {
		const trialEnd = createFreeTrialEndTime()
		testIsFutureDate(trialEnd)
	})

	test('Should be at least 30 days in the future', () => {
		const trialEnd = createFreeTrialEndTime()
		testIsAtLeast30Days(trialEnd)
	})

	test('Should end a second before midnight, UK time', () => {
		const trialEnd = createFreeTrialEndTime()
		testEndsBeforeMidnightUK(trialEnd)
	})
})

describe('Works at different times', () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	const testTimes = [
		{ time: '2023-01-01T12:00:00', name: 'noon' },
		{ time: '2023-01-01T23:59:00', name: 'minute before midnight' },
		{ time: '2023-01-01T23:59:59', name: 'second before midnight' },
		{ time: '2023-01-01T00:00:00', name: 'midnight' },
		{ time: '2023-01-01T00:00:01', name: 'second after midnight' },
		{ time: '2023-01-01T00:01:00', name: 'minute after midnight' },
		{ time: '2023-06-15T14:30:00', name: 'summer afternoon (BST)' },
		{ time: '2023-12-25T18:00:00', name: 'winter evening (GMT)' },
	]

	for (const { time, name } of testTimes) {
		test(name, () => {
			vi.setSystemTime(new Date(time))
			const trialEnd = createFreeTrialEndTime()

			testIsFutureDate(trialEnd)
			testIsAtLeast30Days(trialEnd)
			testEndsBeforeMidnightUK(trialEnd)
		})
	}
})

/* 
pnpm vitest src/library/utilities/public/definitions/createFreeTrialEndTime
*/
