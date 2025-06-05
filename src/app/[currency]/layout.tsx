import { currencyCodeMap, currencyOptions, getMetaDescription } from '@/library/constants'
import type { CurrencyPath } from '@/types'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

type CurrencyProps = { params: Params }
type ResolvedParams = { currency: string }
type Params = Promise<ResolvedParams>
type StaticParams = Promise<ResolvedParams[]>

export async function generateStaticParams(): StaticParams {
	const otherOptions = Object.values(currencyOptions)
		.filter((option) => option.lowerCaseCode !== 'gbp')
		.map((option) => ({ currency: option.lowerCaseCode }))

	return otherOptions
}

export async function generateMetadata({ params }: CurrencyProps): Promise<Metadata> {
	const { currency } = await params

	if (!(currency && currency in currencyCodeMap)) {
		throw new Error(`Invalid currency: ${currency}.`)
	}

	const upperCaseCurrency = currencyCodeMap[currency as CurrencyPath]
	const { upperCaseCode, lowerCaseCode } = currencyOptions[upperCaseCurrency]

	return {
		// Title is exactly the same as GBP homepage
		description: getMetaDescription(upperCaseCode),
		alternates: {
			canonical: `/${lowerCaseCode}`,
		},
	}
}

export default async function CurrencyLayout({ children }: { children: ReactNode }) {
	return <>{children}</>
}
