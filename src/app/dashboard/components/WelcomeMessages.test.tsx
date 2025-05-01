import { UserContext, type UserContextType } from '@/providers/user'
import type { BrowserSafeCompositeUser, BrowserSafeMerchantProduct } from '@/types'
import { cleanup, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import WelcomeMessages from './WelcomeMessages'

function MockUserProvider({ children, mockValues }: { children: ReactNode; mockValues: UserContextType }) {
	return <UserContext.Provider value={mockValues}>{children}</UserContext.Provider>
}

const baseUser: BrowserSafeCompositeUser = {
	firstName: 'Test',
	lastName: 'User',
	email: 'testuser@gmail.com',
	businessName: 'Test Business',
	slug: 'test-business',
	roles: 'merchant',
	activeSubscriptionOrTrial: false,
	emailConfirmed: false,
}

const baseContext: UserContextType = {
	user: baseUser,
	setUser: vi.fn(),
	inventory: null,
	setInventory: vi.fn(),
	confirmedMerchants: null,
	setConfirmedMerchants: vi.fn(),
	confirmedCustomers: null,
	setConfirmedCustomers: vi.fn(),
	invitationsReceived: null,
	setInvitationsReceived: vi.fn(),
	invitationsSent: null,
	setInvitationsSent: vi.fn(),
	ordersMade: null,
	setOrdersMade: vi.fn(),
	ordersReceived: null,
	setOrdersReceived: vi.fn(),
	vat: 20,
	isLoading: false,
}

const inventory: BrowserSafeMerchantProduct[] = [
	{
		id: 1,
		name: 'Ginger beer',
		description: 'A spicy fizzy drink',
		priceInMinorUnits: 86,
		customVat: 20,
		deletedAt: null,
	},
]

describe('WelcomeMessages', () => {
	afterEach(() => {
		cleanup()
	})

	describe('Email confirmation messages', () => {
		test('Asks to confirm email when emailConfirmed is false', () => {
			render(
				<MockUserProvider mockValues={baseContext}>
					<WelcomeMessages />
				</MockUserProvider>,
			)

			expect(
				screen.getByText(
					/Please confirm your email by clicking the link in the email sent to testuser@gmail.com. Remember to check your junk folder./i,
				),
			).toBeDefined()
		})

		test('Does not ask to confirm email when emailConfirmed is true', () => {
			render(
				<MockUserProvider
					mockValues={{
						...baseContext,
						user: { ...baseUser, emailConfirmed: true },
					}}
				>
					<WelcomeMessages />
				</MockUserProvider>,
			)

			const emailConfirmMessage = screen.queryByText(
				/Please confirm your email by clicking the link in the email sent to testuser@gmail.com. Remember to check your junk folder./i,
			)

			expect(emailConfirmMessage).toBeNull()
		})
	})

	describe('Empty inventory message', () => {
		test('Merchants - recommends adding first product when there is no inventory', () => {
			render(
				<MockUserProvider mockValues={{ ...baseContext, user: { ...baseUser, roles: 'merchant' } }}>
					<WelcomeMessages />
				</MockUserProvider>,
			)
			const addProductLink = screen.getByRole('link', { name: /add your first product/i })
			expect(addProductLink).toBeDefined()
			expect(addProductLink.getAttribute('href')).toBe('/inventory')
		})

		test('Both - recommends adding first product when there is no inventory', () => {
			render(
				<MockUserProvider mockValues={{ ...baseContext, user: { ...baseUser, roles: 'both' } }}>
					<WelcomeMessages />
				</MockUserProvider>,
			)
			const addProductLink = screen.getByRole('link', { name: /add your first product/i })
			expect(addProductLink).toBeDefined()
			expect(addProductLink.getAttribute('href')).toBe('/inventory')
		})

		test('Customer - does not recommend adding first product if inventory is empty', () => {
			render(
				<MockUserProvider mockValues={{ ...baseContext, user: { ...baseUser, roles: 'customer' } }}>
					<WelcomeMessages />
				</MockUserProvider>,
			)
			const addProductText = screen.queryByText(/add your first product/i)
			expect(addProductText).toBeNull()
		})

		test('Customer - does not recommend adding first product even if there are items in the inventory (weird unlikely situation)', () => {
			render(
				<MockUserProvider
					mockValues={{
						...baseContext,
						user: {
							...baseUser,
							roles: 'customer',
						},
						inventory,
					}}
				>
					<WelcomeMessages />
				</MockUserProvider>,
			)
			const addProductText = screen.queryByText(/add your first product/i)
			expect(addProductText).toBeNull()
		})

		test('Merchant - does not recommend adding first if there are items in the inventory', () => {
			render(
				<MockUserProvider
					mockValues={{
						...baseContext,
						user: {
							...baseUser,
							roles: 'merchant',
						},
						inventory,
					}}
				>
					<WelcomeMessages />
				</MockUserProvider>,
			)
			const addProductText = screen.queryByText(/add your first product/i)
			expect(addProductText).toBeNull()
		})

		test('Both - does not recommend adding first if there are items in the inventory', () => {
			render(
				<MockUserProvider
					mockValues={{
						...baseContext,
						user: {
							...baseUser,
							roles: 'both',
						},
						inventory,
					}}
				>
					<WelcomeMessages />
				</MockUserProvider>,
			)
			const addProductText = screen.queryByText(/add your first product/i)
			expect(addProductText).toBeNull()
		})
	})
})

/*
pnpm vitest src/app/dashboard/components/WelcomeMessages
*/
