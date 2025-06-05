import { type NextRequest, NextResponse } from 'next/server'
import { currencyContinentMap, currencyCountryMap } from './library/constants'
import { isDevelopment } from './library/environment/publicVariables'
import type { ContinentCode, CountryCode, CurrencyPath } from './types'

function getCurrencyPath(request: NextRequest): CurrencyPath | null {
	const pretendToBeSomewhereElse = isDevelopment && false
	const fakedCountryCode: CountryCode = 'FR'

	const country = pretendToBeSomewhereElse ? fakedCountryCode : (request.headers.get('x-vercel-ip-country') as CountryCode) || null

	const continent: ContinentCode | null = (request.headers.get('x-vercel-ip-continent') as ContinentCode) || null

	let currency = country ? currencyCountryMap[country] : null

	if (!currency && continent) {
		currency = currencyContinentMap[continent]
	}

	return currency
}

export function middleware(request: NextRequest) {
	if (request.nextUrl.pathname === '/') {
		const currency = getCurrencyPath(request)

		if (currency && currency !== 'gbp') {
			return NextResponse.redirect(new URL(`/${currency}`, request.url))
		}
	}
}
