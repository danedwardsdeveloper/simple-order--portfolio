export const apiPaths = {
	// Working RESTful routes that I'm happy with
	customers: {
		base: '/api/customers',
	},
	invitations: {
		// POST create an invitation.
		// The code could be cleaned up but I think it works okay.
		base: '/api/invitations',

		// PATCH accept an invitation
		// I think this works fine but it needs thorough testing
		accept: '/api/invitations/[token]',
	},
	merchants: {
		// GET confirmed & pending merchants for the signed-in customer
		base: '/api/merchants',
	},

	// Major ToDos / not RESTful / Broken / Not sure...
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
		createCheckoutSession: '/api/stripe/create-checkout-session',
		createPortalSession: '/api/ stripe/create-portal-session',
		webhook: '/api/stripe/webhook',
	},
} as const
