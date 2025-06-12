// ToDo: Add currency pages somehow!?

/**
 * List of site paths for robots.ts & sitemap.ts, excluding the home page, currency pages and individual articles pages
 */
export const sitePaths: Array<{ path: string; hidden?: boolean }> = [
	{
		path: '/favicon.ico',
		hidden: true,
	},
	{
		path: '/account',
		hidden: true,
	},
	{
		path: '/accept-invitation',
		hidden: true,
	},
	{ path: '/articles' },
	{
		path: '/checkout',
		hidden: true,
	},
	{
		path: '/confirm',
		hidden: true,
	},
	{ path: '/contact' },
	{
		path: '/customers',
		hidden: true,
	},
	{ path: '/create-account' }, // Redirected
	{
		path: '/dashboard',
		hidden: true,
	},
	{
		path: '/demo', // Not using this page at all
		hidden: true,
	},
	{ path: '/demo/customers' },
	{ path: '/demo/dashboard' },
	{ path: '/demo/inventory' },
	{ path: '/demo/orders' },
	{ path: '/demo/settings' },
	{ path: '/free-trial' },
	{
		path: '/inventory',
		hidden: true,
	},
	{
		path: '/merchants',
		hidden: true,
	},
	{
		path: '/orders',
		hidden: true,
	},
	{ path: '/sign-in' },
	{
		path: '/settings',
		hidden: true,
	},
]
