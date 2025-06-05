import { may } from '@/library/constants'
import { createCutOffTime } from '@/library/shared'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { givesEnoughNotice } from '.'

interface Suite {
	suiteDescription: string
	suiteExpectedBoolean: () => boolean
	cases: Case[]
}

interface Case {
	caseDescription: string
	caseMockedTime: Date
	caseLeadTimeDays: number
	caseCutOffTime: Date
	caseRequestedDeliveryDate: Date
}

describe('givesEnoughNotice', () => {
	beforeEach(() => vi.useFakeTimers())
	afterEach(() => vi.useRealTimers())

	const suites: Suite[] = [
		{
			suiteDescription: 'Accepted',
			suiteExpectedBoolean: () => true,
			cases: [
				{
					caseDescription: 'Just before cutoff time',
					caseMockedTime: new Date(2025, may, 1, 17, 59),
					caseLeadTimeDays: 1,
					caseCutOffTime: createCutOffTime({ hours: 18, minutes: 0 }),
					caseRequestedDeliveryDate: new Date(2025, may, 2),
				},
				{
					caseDescription: 'One second before cutoff',
					caseMockedTime: new Date(2025, may, 1, 17, 59, 59),
					caseLeadTimeDays: 1,
					caseCutOffTime: createCutOffTime({ hours: 18, minutes: 0 }),
					caseRequestedDeliveryDate: new Date(2025, may, 2),
				},
				{
					caseDescription: 'Exactly at cutoff time',
					caseMockedTime: new Date(2025, may, 1, 18, 0, 0),
					caseLeadTimeDays: 1,
					caseCutOffTime: createCutOffTime({ hours: 18, minutes: 0 }),
					caseRequestedDeliveryDate: new Date(2025, may, 2),
				},
				{
					caseDescription: 'Early morning order',
					caseMockedTime: new Date(2025, may, 1, 8, 0),
					caseLeadTimeDays: 1,
					caseCutOffTime: createCutOffTime({ hours: 18, minutes: 0 }),
					caseRequestedDeliveryDate: new Date(2025, may, 2),
				},
				{
					caseDescription: 'Same day delivery with leadTimeDays=0',
					caseMockedTime: new Date(2025, may, 1, 8, 0),
					caseLeadTimeDays: 0,
					caseCutOffTime: createCutOffTime({ hours: 12, minutes: 0 }),
					caseRequestedDeliveryDate: new Date(2025, may, 1),
				},
				{
					caseDescription: 'Day before BST starts (Saturday)',
					caseMockedTime: new Date(2025, 2, 29, 12, 0), // March 29
					caseLeadTimeDays: 1,
					caseCutOffTime: createCutOffTime({ hours: 18, minutes: 0 }),
					caseRequestedDeliveryDate: new Date(2025, 2, 30),
				},
				{
					caseDescription: 'Order during BST change (Sunday morning)',
					caseMockedTime: new Date(2025, 2, 30, 10, 0), // March 30, after spring forward
					caseLeadTimeDays: 1,
					caseCutOffTime: createCutOffTime({ hours: 18, minutes: 0 }),
					caseRequestedDeliveryDate: new Date(2025, 2, 31),
				},
				{
					caseDescription: 'Day before BST ends (Saturday)',
					caseMockedTime: new Date(2025, 9, 25, 12, 0), // October 25
					caseLeadTimeDays: 1,
					caseCutOffTime: createCutOffTime({ hours: 18, minutes: 0 }),
					caseRequestedDeliveryDate: new Date(2025, 9, 26),
				},
				{
					caseDescription: 'Multi-day lead time',
					caseMockedTime: new Date(2025, may, 1, 17, 0),
					caseLeadTimeDays: 3,
					caseCutOffTime: createCutOffTime({ hours: 18, minutes: 0 }),
					caseRequestedDeliveryDate: new Date(2025, may, 4),
				},
				{
					caseDescription: 'Order on Friday for Monday with 3-day lead time',
					caseMockedTime: new Date(2025, may, 2, 9, 0), // Friday
					caseLeadTimeDays: 3,
					caseCutOffTime: createCutOffTime({ hours: 18, minutes: 0 }),
					caseRequestedDeliveryDate: new Date(2025, may, 5), // Monday
				},
			],
		},
		{
			suiteDescription: 'Rejected',
			suiteExpectedBoolean: () => false,
			cases: [
				{
					caseDescription: 'One second after cutoff',
					caseMockedTime: new Date(2025, may, 1, 18, 0, 1),
					caseLeadTimeDays: 1,
					caseCutOffTime: createCutOffTime({ hours: 18, minutes: 0 }),
					caseRequestedDeliveryDate: new Date(2025, may, 2),
				},
				{
					caseDescription: 'Well after cutoff',
					caseMockedTime: new Date(2025, may, 1, 23, 59),
					caseLeadTimeDays: 1,
					caseCutOffTime: createCutOffTime({ hours: 18, minutes: 0 }),
					caseRequestedDeliveryDate: new Date(2025, may, 2),
				},
				{
					caseDescription: 'Not enough lead days',
					caseMockedTime: new Date(2025, may, 1, 10, 0),
					caseLeadTimeDays: 2,
					caseCutOffTime: createCutOffTime({ hours: 18, minutes: 0 }),
					caseRequestedDeliveryDate: new Date(2025, may, 2),
				},
				{
					caseDescription: 'Same day delivery after cutoff with leadTimeDays=0',
					caseMockedTime: new Date(2025, may, 1, 14, 0),
					caseLeadTimeDays: 0,
					caseCutOffTime: createCutOffTime({ hours: 0, minutes: 12 }),
					caseRequestedDeliveryDate: new Date(2025, may, 1),
				},
				{
					caseDescription: 'Delivery date in the past',
					caseMockedTime: new Date(2025, may, 5, 10, 0),
					caseLeadTimeDays: 1,
					caseCutOffTime: createCutOffTime({ hours: 18, minutes: 0 }),
					caseRequestedDeliveryDate: new Date(2025, may, 4),
				},
			],
		},
	]

	for (const { suiteDescription, cases, suiteExpectedBoolean } of suites) {
		describe(suiteDescription, () => {
			//
			for (const { caseDescription, caseMockedTime, caseCutOffTime, caseLeadTimeDays, caseRequestedDeliveryDate } of cases) {
				//
				test(caseDescription, () => {
					vi.setSystemTime(caseMockedTime)
					expect(
						givesEnoughNotice({
							leadTimeDays: caseLeadTimeDays,
							cutOffTime: caseCutOffTime,
							requestedDeliveryDate: caseRequestedDeliveryDate,
						}),
					).toEqual(suiteExpectedBoolean())
				})
			}
		})
	}
})

/* 
pnpm vitest src/library/utilities/public/definitions/givesEnoughNotice
*/
