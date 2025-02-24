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
	invitations: {
		create: '/api/invitations/create',
		accept: '/api/invitations/accept',
	},
	merchants: {
		base: '/api/merchants',
		merchantSlug: '/api/merchants/[merchantSlug]',
	},
	inventory: {
		admin: {
			base: '/api/inventory/admin',
			// Get all inventory items (including drafts/deleted) ✅
			// POST: Create new item ✅

			itemId: '/api/inventory/admin/[itemId]',
			// PUT: Update item
			// DELETE: Delete item ✅
		},
		merchants: {
			base: '/api/inventory/merchants', // ✅
			merchantSlug: '/api/inventory/merchants/[merchantSlug]',
			// GET Customer view of a specific merchant's published products
		},
	},
	order: {
		base: '/api/orders',
		orderId: '/api/orders/[orderId]',
	},
	stripe: {
		createCheckoutSession: '/api/ stripe/checkout/create-checkout-session',
		createPortalSession: '/api/ stripe/create-portal-session',
		webhook: '/api/stripe/webhook',
	},
} as const
