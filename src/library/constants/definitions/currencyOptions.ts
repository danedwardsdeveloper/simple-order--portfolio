import type { CurrencyCode, PricingDetails } from '@/types'

export const currencyOptions: Record<CurrencyCode, PricingDetails> = {
	GBP: {
		symbol: '£', //
		amountInMinorUnits: 2000,
		upperCaseCode: 'GBP',
		lowerCaseCode: 'gbp',
		formatted: '£20',
		formattedFull: '£20',
	},
	USD: {
		symbol: '$',
		amountInMinorUnits: 2700,
		upperCaseCode: 'USD',
		lowerCaseCode: 'usd',
		formatted: '$27',
		formattedFull: '$27', // Leave unlabelled
	},
	CAD: {
		symbol: '$',
		amountInMinorUnits: 3700,
		upperCaseCode: 'CAD',
		lowerCaseCode: 'cad',
		formatted: '$37',
		formattedFull: 'CAD $37',
		dollarLabel: 'CAD',
	},
	EUR: {
		symbol: '€',
		amountInMinorUnits: 2400,
		upperCaseCode: 'EUR',
		lowerCaseCode: 'eur',
		formatted: '€24',
		formattedFull: '€24',
	},
	AUD: {
		symbol: '$',
		amountInMinorUnits: 4200,
		upperCaseCode: 'AUD',
		lowerCaseCode: 'aud',
		formatted: '$42',
		formattedFull: 'AUD $42',
		dollarLabel: 'AUD',
	},
	NZD: {
		symbol: '$',
		amountInMinorUnits: 4500,
		upperCaseCode: 'NZD',
		lowerCaseCode: 'nzd',
		formatted: '$45',
		formattedFull: 'NZD $45',
		dollarLabel: 'NZD',
	},
}
