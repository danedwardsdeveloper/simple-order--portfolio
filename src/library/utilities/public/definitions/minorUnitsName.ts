import type { UiContextData } from '@/types/definitions/contexts/ui'

export function minorUnitsName(currency: UiContextData['currency']): 'pence' | 'cents' {
	if (currency === 'GBP') return 'pence'
	return 'cents'
}
