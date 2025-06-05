// ToDo: Add currency pages somehow!?

/**
 * List of site paths for robots.ts & sitemap.ts, excluding the home page, currency pages and individual articles pages
 */
export const sitePaths: Array<{ path: string; hidden: boolean }> = [
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
	{
		path: '/articles',
		hidden: false,
	},
	{
		path: '/checkout',
		hidden: true,
	},
	{
		path: '/confirm',
		hidden: true,
	},
	{
		path: '/contact',
		hidden: false,
	},
	{
		path: '/customers',
		hidden: true,
	},
	{
		path: '/create-account', // Redirected
		hidden: false,
	},
	{
		path: '/dashboard',
		hidden: true,
	},
	{
		path: '/demo', // Not using this page at all
		hidden: true,
	},
	{
		path: '/demo/customers',
		hidden: false,
	},
	{
		path: '/demo/dashboard',
		hidden: false,
	},
	{
		path: '/demo/inventory',
		hidden: false,
	},
	{
		path: '/demo/orders',
		hidden: false,
	},
	{
		path: '/demo/settings',
		hidden: false,
	},
	{
		path: '/free-trial',
		hidden: false,
	},
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
	{
		path: '/sign-in',
		hidden: false,
	},
	{
		path: '/settings',
		hidden: true,
	},
]
