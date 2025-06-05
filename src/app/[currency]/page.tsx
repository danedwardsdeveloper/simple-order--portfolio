'use client'
import HomePageContent from '@/components/HomePageContent'
import { useUi } from '@/components/providers/ui'
import { currencyCodeMap, currencyOptions } from '@/library/constants'
import type { CurrencyPath } from '@/types'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'

export default function CurrencyPage() {
	const params = useParams()
	const currency = params.currency as string

	const { storeCurrency } = useUi()

	useEffect(() => {
		if (currency && currency in currencyCodeMap) {
			const upperCaseCurrency = currencyCodeMap[currency as CurrencyPath]
			storeCurrency(upperCaseCurrency)
		}
	}, [currency, storeCurrency])

	if (!(currency && currency in currencyCodeMap)) {
		throw new Error(`Invalid currency: ${currency}.`)
	}

	const upperCaseCurrency = currencyCodeMap[currency as CurrencyPath]
	const pricingDetails = currencyOptions[upperCaseCurrency]

	return <HomePageContent pricingDetails={pricingDetails} />
}
