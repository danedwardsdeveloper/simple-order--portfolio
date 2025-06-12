import type { BrowserSafeMerchantProduct, UserContextType } from '@/types'
import { type Matcher, cleanup, render, screen } from '@testing-library/react'
import { gingerBeer } from '@tests/constants'
import { MockUserProvider, baseContext, baseUser } from '@tests/constants/mockUserContext'
import { afterEach, describe, expect, test } from 'vitest'
import WelcomeMessages from './WelcomeMessages'

const yesterday = new Date()
yesterday.setDate(yesterday.getDate() - 1)

const thirtyDaysTime = new Date()
thirtyDaysTime.setDate(thirtyDaysTime.getDate() + 30)

const inventory: BrowserSafeMerchantProduct[] = [gingerBeer as BrowserSafeMerchantProduct]

type Suite = {
	suiteDescription: string
	cases: Case[]
}

type Case = {
	caseDescription: string
	caseContext: UserContextType
	caseText: Matcher
	expectDefined: boolean
}

const suites: Suite[] = [
	{
		suiteDescription: 'Customer only',
		cases: [
			// Email confirmation cases
			{
				caseDescription: 'Asks to confirm email when emailConfirmed is false',
				caseContext: { ...baseContext, user: { ...baseUser, roles: 'customer' } },
				caseText:
					/Please confirm your email by clicking the link in the email sent to testuser@gmail.com. Remember to check your junk folder./i,
				expectDefined: true,
			},
			{
				caseDescription: 'Does not ask to confirm email when emailConfirmed is true',
				caseContext: {
					...baseContext,
					user: { ...baseUser, roles: 'customer', emailConfirmed: true },
				},
				caseText:
					/Please confirm your email by clicking the link in the email sent to testuser@gmail.com. Remember to check your junk folder./i,
				expectDefined: false,
			},
			// Inventory cases
			{
				caseDescription: 'Does not recommend adding first product when inventory is empty',
				caseContext: { ...baseContext, user: { ...baseUser, roles: 'customer' } },
				caseText: /add your first product/i,
				expectDefined: false,
			},
			{
				caseDescription: 'Does not recommend adding first product even with items in inventory',
				caseContext: {
					...baseContext,
					user: { ...baseUser, roles: 'customer' },
					inventory: inventory,
				},
				caseText: /add your first product/i,
				expectDefined: false,
			},
			// Subscription messages should not appear for customers
			{
				caseDescription: 'Does not show subscription message even if trial has ended',
				caseContext: {
					...baseContext,
					user: { ...baseUser, roles: 'customer', trialEnd: yesterday },
				},
				caseText: /Please subscribe to continue using Simple Order/i,
				expectDefined: false,
			},
		],
	},
	{
		suiteDescription: 'Merchant only',
		cases: [
			// Email confirmation cases
			{
				caseDescription: 'Asks to confirm email when emailConfirmed is false',
				caseContext: { ...baseContext, user: { ...baseUser, roles: 'merchant' } },
				caseText:
					/Please confirm your email by clicking the link in the email sent to testuser@gmail.com. Remember to check your junk folder./i,
				expectDefined: true,
			},
			{
				caseDescription: 'Does not ask to confirm email when emailConfirmed is true',
				caseContext: {
					...baseContext,
					user: { ...baseUser, roles: 'merchant', emailConfirmed: true },
				},
				caseText:
					/Please confirm your email by clicking the link in the email sent to testuser@gmail.com. Remember to check your junk folder./i,
				expectDefined: false,
			},
			// Inventory cases
			{
				caseDescription: 'Recommends adding first product when inventory is empty',
				caseContext: { ...baseContext, user: { ...baseUser, roles: 'merchant' } },
				caseText: /add your first product/i,
				expectDefined: true,
			},
			{
				caseDescription: 'Does not recommend adding first product when inventory has items',
				caseContext: {
					...baseContext,
					user: { ...baseUser, roles: 'merchant' },
					inventory: inventory,
				},
				caseText: /add your first product/i,
				expectDefined: false,
			},
			// Subscription cases - all combinations
			{
				caseDescription: 'Asks to subscribe if trial has ended and subscriptionEnd is undefined',
				caseContext: {
					...baseContext,
					user: { ...baseUser, roles: 'merchant', trialEnd: yesterday, subscriptionEnd: null },
				},
				caseText: /Please subscribe to continue using Simple Order/i,
				expectDefined: true,
			},
			{
				caseDescription: 'Asks to subscribe if trial and subscription have ended',
				caseContext: {
					...baseContext,
					user: { ...baseUser, roles: 'merchant', trialEnd: yesterday, subscriptionEnd: yesterday },
				},
				caseText: /Your subscription has ended. Please renew your subscription to continue using all features./i,
				expectDefined: true,
			},
			{
				caseDescription: 'Does not ask to subscribe if trial has not ended (no subscription)',
				caseContext: {
					...baseContext,
					user: { ...baseUser, roles: 'merchant', trialEnd: thirtyDaysTime, subscriptionEnd: null },
				},
				caseText: /Please subscribe to continue using Simple Order/i,
				expectDefined: false,
			},
			{
				caseDescription: 'Asks to subscribe if trial has not ended but subscription has ended',
				caseContext: {
					...baseContext,
					user: { ...baseUser, roles: 'merchant', trialEnd: thirtyDaysTime, subscriptionEnd: yesterday },
				},
				caseText: /Please subscribe to continue using Simple Order/i,
				expectDefined: true,
			},
			{
				caseDescription: 'Does not ask to subscribe if trial has ended but subscription has not ended',
				caseContext: {
					...baseContext,
					user: { ...baseUser, roles: 'merchant', trialEnd: yesterday, subscriptionEnd: thirtyDaysTime },
				},
				caseText: /Please subscribe to continue using Simple Order/i,
				expectDefined: false,
			},
		],
	},
	{
		suiteDescription: 'Both roles',
		cases: [
			// Email confirmation cases
			{
				caseDescription: 'Asks to confirm email when emailConfirmed is false',
				caseContext: { ...baseContext, user: { ...baseUser, roles: 'both' } },
				caseText:
					/Please confirm your email by clicking the link in the email sent to testuser@gmail.com. Remember to check your junk folder./i,
				expectDefined: true,
			},
			{
				caseDescription: 'Does not ask to confirm email when emailConfirmed is true',
				caseContext: {
					...baseContext,
					user: { ...baseUser, roles: 'both', emailConfirmed: true },
				},
				caseText:
					/Please confirm your email by clicking the link in the email sent to testuser@gmail.com. Remember to check your junk folder./i,
				expectDefined: false,
			},
			// Inventory cases
			{
				caseDescription: 'Recommends adding first product when inventory is empty',
				caseContext: { ...baseContext, user: { ...baseUser, roles: 'both' } },
				caseText: /add your first product/i,
				expectDefined: true,
			},
			{
				caseDescription: 'Does not recommend adding first product when inventory has items',
				caseContext: {
					...baseContext,
					user: { ...baseUser, roles: 'both' },
					inventory: inventory,
				},
				caseText: /add your first product/i,
				expectDefined: false,
			},

			// Subscription ended cases - all combinations
			{
				caseDescription: 'Asks to subscribe if trial has ended and no subscription',
				caseContext: {
					...baseContext,
					user: { ...baseUser, roles: 'both', trialEnd: yesterday, subscriptionEnd: null },
				},
				caseText: /Please subscribe to continue using Simple Order/i,
				expectDefined: true,
			},
			{
				caseDescription: 'Asks to subscribe if trial and subscription have ended',
				caseContext: {
					...baseContext,
					user: { ...baseUser, roles: 'both', trialEnd: yesterday, subscriptionEnd: yesterday },
				},
				caseText: /Please subscribe to continue using Simple Order/i,
				expectDefined: true,
			},
			{
				caseDescription: "Doesn't ask to subscribe if trial and subscription haven't ended",
				caseContext: {
					...baseContext,
					user: { ...baseUser, roles: 'both', trialEnd: thirtyDaysTime, subscriptionEnd: thirtyDaysTime },
				},
				caseText: /Please subscribe to continue using Simple Order/i,
				expectDefined: false,
			},
			{
				caseDescription: "Doesn't ask to subscribe if trial hasn't ended (no subscription)",
				caseContext: {
					...baseContext,
					user: { ...baseUser, roles: 'both', trialEnd: thirtyDaysTime, subscriptionEnd: null },
				},
				caseText: /Please subscribe to continue using Simple Order/i,
				expectDefined: false,
			},
			{
				caseDescription: 'Asks to subscribe if trial has not ended but subscription has ended',
				caseContext: {
					...baseContext,
					user: { ...baseUser, roles: 'both', trialEnd: thirtyDaysTime, subscriptionEnd: yesterday },
				},
				caseText: /Your subscription has ended. Please renew your subscription to continue using all features./i,
				expectDefined: false,
			},
			{
				caseDescription: "Doesn't ask to subscribe if trial has ended but subscription hasn't ended",
				caseContext: {
					...baseContext,
					user: { ...baseUser, roles: 'both', trialEnd: yesterday, subscriptionEnd: thirtyDaysTime },
				},
				caseText: /Please subscribe to continue using Simple Order/i,
				expectDefined: false,
			},
		],
	},
]

describe.skip('WelcomeMessages', () => {
	afterEach(() => {
		cleanup()
	})

	for (const { suiteDescription, cases } of suites) {
		describe(suiteDescription, () => {
			for (const { caseDescription, caseContext, caseText, expectDefined } of cases) {
				test(caseDescription, () => {
					render(
						<MockUserProvider mockValues={caseContext}>
							<WelcomeMessages />
						</MockUserProvider>,
					)

					const element = screen.queryByText(caseText)

					if (expectDefined) {
						expect(element).not.toBeNull()
					} else {
						expect(element).toBeNull()
					}
				})
			}
		})
	}
})

/*
pnpm vitest src/app/dashboard/components/WelcomeMessages
*/
