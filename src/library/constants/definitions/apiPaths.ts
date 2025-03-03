export const apiPaths = {
	authentication: {
		signIn: '/api/authentication/sign-in',
		createAccount: '/api/authentication/create-account',
		signOut: '/api/authentication/sign-out',
		verifyToken: '/api/authentication/verify-token',
		email: {
			confirm: '/api/authentication/email/confirm',
			resend: '/api/authentication/email/resend',
		},
	},
	customers: {
		base: '/api/customers',
	},
	invitations: {
		base: '/api/invitations',
		accept: '/api/invitations/[token]',
	},
	merchants: {
		base: '/api/merchants',
	},
	inventory: {
		admin: {
			base: '/api/inventory/admin',
			itemId: '/api/inventory/admin/[itemId]',
		},
		merchants: {
			base: '/api/inventory/merchants',
			merchantSlug: '/api/inventory/merchants/[merchantSlug]',
		},
	},
	order: {
		base: '/api/orders',
		orderId: '/api/orders/[orderId]',
	},
	stripe: {
		createCheckoutSession: '/api/stripe/create-checkout-session',
		createPortalSession: '/api/ stripe/create-portal-session',
		webhook: '/api/stripe/webhook',
	},
} as const
