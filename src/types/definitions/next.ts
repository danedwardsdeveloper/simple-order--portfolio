// Turn this into a package!
export type NextDynamic = 'auto' | 'force-dynamic' | 'error' | 'force-static'
export type NextDynamicParams = boolean
export type NextRevalidate = false | 0 | number
export type NextFetchCache =
	| 'auto'
	| 'default-cache'
	| 'only-cache'
	| 'force-cache'
	| 'force-no-store'
	| 'default-no-store'
	| 'only-no-store'
export type NextRuntime = 'nodejs' | 'edge'
export type NextPreferredRegion = 'auto' | 'global' | 'home' | string | string[]

export interface NextRouteConfig {
	experimental_ppr?: boolean
	dynamic?: NextDynamic
	dynamicParams?: NextDynamicParams
	revalidate?: NextRevalidate
	fetchCache?: NextFetchCache
	runtime?: NextRuntime
	preferredRegion?: NextPreferredRegion
	maxDuration?: number
}

function _nextRouteConfig({
	dynamic = 'auto',
	dynamicParams = true,
	revalidate = false,
	fetchCache = 'auto',
	runtime = 'nodejs',
	preferredRegion = 'auto',
	...propertiesWithoutDefaults
}: NextRouteConfig = {}): NextRouteConfig {
	return {
		dynamic,
		dynamicParams,
		revalidate,
		fetchCache,
		runtime,
		preferredRegion,
		...propertiesWithoutDefaults,
	}
}

// export const { runtime } = nextRouteConfig({ runtime: 'edge' })
