import type { BaseBrowserSafeUser, BrowserSafeMerchantProduct } from '@/types'

export interface WipConfirmedCustomer {
	businessName: string
	firstName: string
}

export interface WipPendingCustomer {
	obfuscatedEmail: string
	lastSendDate: Date
}

export interface WipExpiredCustomer {
	obfuscatedEmail: string
	lastSendDate: Date
}

export interface WipMerchant {
	[merchantSlug: string]: {
		businessName: string
		orders: {
			orderId: number
			createdAt: Date
			updatedAt: Date
			status: 'draft' | 'submitted' | 'processed'
			items: {
				name: string
				quantity: number
			}[]
		}[]
	}
}

export interface WipUser extends BaseBrowserSafeUser {
	merchantData?: {
		accountType: 'trial' | 'paid' | 'expired'
		freeTrialExpiry: Date
		subscriptionData: {
			lastPayment: Date
			nextPayment: Date
		}
		vatSettings: {
			defaultRate: number
			rateOptions: number[]
		}
		customers: {
			confirmed: WipConfirmedCustomer[]
			pending: WipPendingCustomer[]
			expired: WipExpiredCustomer[]
		}
	}
	inventory: BrowserSafeMerchantProduct[]
	merchants?: WipMerchant[]
}

export const temporaryFullClientSafeUser: WipUser = {
	firstName: '',
	lastName: '',
	email: '',
	businessName: '',
	emailConfirmed: false,
	cachedTrialExpired: false,
	merchantData: {
		accountType: 'trial',
		freeTrialExpiry: new Date(),
		subscriptionData: {
			lastPayment: new Date(),
			nextPayment: new Date(),
		},
		vatSettings: {
			defaultRate: 20,
			rateOptions: [20, 5, 0],
		},
		customers: {
			confirmed: [],
			pending: [],
			expired: [],
		},
	},
	inventory: [
		{
			id: 1,
			name: 'Croissant, plain',
			description: 'The classic French pastry.',
			priceInMinorUnits: 84,
			customVat: null,
			deletedAt: null,
		},
		{
			id: 23,
			name: 'Sourdough loaf, white',
			description: 'A flavorsome hand-crafted white loaf created with a 30-year-old starter.',
			priceInMinorUnits: 289,
			customVat: 0,
			deletedAt: null,
		},
	],
	merchants: [
		{
			'janes-bakery': {
				businessName: "Jane's Bakery",
				orders: [
					{
						orderId: 1,
						createdAt: new Date(),
						updatedAt: new Date(),
						status: 'draft',
						items: [
							{
								name: 'Croissant, plain',
								quantity: 7,
							},
							{
								name: 'Sourdough loaf, white',
								quantity: 5,
							},
						],
					},
				],
			},
		},
	],
}
