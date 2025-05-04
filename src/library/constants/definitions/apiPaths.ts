/**
 * @deprecated The file system is the single source of truth now
 */
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
		base: '/api/orders',
		orderId: '/api/orders/[orderId]',
		admin: {
			base: '/api/orders/admin',
			update: '/api/orders/admin/[orderId]',
		},
	},
} as const
