// This is only a record of the paths for making fetch requests and logging errors.
// Full API details are in my Notion project
export const apiPaths = {
	authentication: {
		createAccount: '/api/authentication/create-account',
		email: {
			confirm: '/api/authentication/email/confirm',
		},
		signIn: '/api/authentication/sign-in',
		signOut: '/api/authentication/sign-out',
		verifyToken: '/api/authentication/verify-token',
	},
	payments: {
		createCheckoutSession: '/api/payments/create-checkout-session',
		webhook: '/api/payments/webhook',
	},
	invitations: {
		base: '/api/invitations',
		accept: '/api/invitations/[token]',
	},
	relationships: '/api/relationships',
	inventory: {
		merchantPerspective: {
			base: '/api/inventory/admin',
			itemId: '/api/inventory/admin/[itemId]',
		},
		customerPerspective: {
			base: '/api/inventory/merchants',
			merchantSlug: '/api/inventory/merchants/[merchantSlug]',
		},
	},
	orders: {
		merchantPerspective: {
			base: '/api/orders/admin',
			update: '/api/orders/admin/[orderId]',
		},
		customerPerspective: {
			base: '/api/orders',
			orderId: '/api/orders/[orderId]',
		},
	},
} as const
