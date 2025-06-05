import { currencyOptions } from '@/library/constants'
import type { CurrencySymbol } from '@/types'
import type { UiContextData } from '@/types/definitions/contexts/ui'

function currencyCodeToSymbol(currency: UiContextData['currency']): CurrencySymbol {
	const { symbol } = currencyOptions[currency]
	if (!symbol) throw new Error(`formatPrice: unsupported currency ${currency}`)
	return symbol
}

function formatMinorUnits(amount: number, currency: UiContextData['currency']): string {
	if (currency === 'GBP') {
		return `${amount}p`
	}
	return `${amount}¢` // or just `${amount}c` if you prefer
}

function formatMajorUnits(amount: number, symbol: CurrencySymbol): string {
	if (Number.isInteger(amount)) {
		return `${symbol}${amount.toLocaleString('en-GB')}`
	}

	return `${symbol}${amount.toLocaleString('en-GB', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})}`
}

export function formatPrice(minorUnits: number, currency: UiContextData['currency']): string {
	if (Number.isNaN(minorUnits)) throw new Error('formatPrice: tried to format NaN')

	const roundedMinorUnits = Math.round(minorUnits)
	const isNegative = roundedMinorUnits < 0
	const negativeSign = isNegative ? '-' : ''
	const absoluteRoundedMinorUnits = Math.abs(roundedMinorUnits)

	if (absoluteRoundedMinorUnits < 100) {
		return `${negativeSign}${formatMinorUnits(absoluteRoundedMinorUnits, currency)}`
	}

	const absoluteMajorUnits = absoluteRoundedMinorUnits / 100
	const symbol = currencyCodeToSymbol(currency)

	return `${negativeSign}${formatMajorUnits(absoluteMajorUnits, symbol)}`
}
