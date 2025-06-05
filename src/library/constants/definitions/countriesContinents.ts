import type { ContinentCode, CountryCode, CurrencyCode, CurrencyPath } from '@/types'

export const currencyCountryMap: Record<CountryCode, CurrencyPath> = {
	GB: 'gbp',
	US: 'usd',
	CA: 'cad',
	DE: 'eur',
	FR: 'eur',
	ES: 'eur',
	IT: 'eur',
	AU: 'aud',
	NZ: 'nzd',
}

export const currencyContinentMap: Record<ContinentCode, CurrencyPath> = {
	EU: 'eur',
	NA: 'usd',
	OC: 'aud',

	// USD is the backup for everywhere else
	AF: 'usd', // Africa
	AN: 'usd', // Antarctica
	AS: 'usd', // Asia
	SA: 'usd', // South America
}

export const currencyCodeMap: Record<CurrencyPath, CurrencyCode> = {
	gbp: 'GBP',
	usd: 'USD',
	cad: 'CAD',
	eur: 'EUR',
	nzd: 'NZD',
	aud: 'AUD',
} as const
