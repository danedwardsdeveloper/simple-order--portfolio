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
	inventory: {
		add: '/api/inventory/add',
		all: '/api/inventory',
	},
} as const
