export type CurrencyCode = 'GBP' | 'USD' | 'CAD' | 'EUR' | 'AUD' | 'NZD'
export type CurrencyPath = 'gbp' | 'usd' | 'cad' | 'eur' | 'aud' | 'nzd'
export type CountryCode = 'GB' | 'US' | 'CA' | 'DE' | 'FR' | 'ES' | 'IT' | 'AU' | 'NZ'
export type CountryPath = 'gb' | 'us' | 'ca' | 'de' | 'fr' | 'es' | 'it' | 'au' | 'nz'
export type ContinentCode = 'AF' | 'AN' | 'AS' | 'EU' | 'NA' | 'OC' | 'SA'

export type CurrencySymbol = '£' | '$' | '€'

export interface PricingDetails {
	symbol: CurrencySymbol
	upperCaseCode: CurrencyCode
	lowerCaseCode: CurrencyPath
	amountInMinorUnits: number
	formatted: string
	formattedFull: string
	dollarLabel?: string
}
