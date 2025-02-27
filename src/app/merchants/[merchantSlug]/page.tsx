'use client'
import type { InventoryMerchantsMerchantSlugGETresponse } from '@/app/api/inventory/merchants/[merchantSlug]/route'
import BreadCrumbs from '@/components/BreadCrumbs'
import Spinner from '@/components/Spinner'
import { apiPaths } from '@/library/constants'
import logger from '@/library/logger'
import type { BrowserSafeCustomerProduct } from '@/types'
import { use, useEffect, useState } from 'react'
import urlJoin from 'url-join'
import CustomerFacingProductCard from './components/CustomerFacingProductCard'

// ToDo: Emphasise 'Merchants' in the menu bar, even though we're one level deeper
// ToDo: remove loading state and use loading.ts
// This page is the order form - there's no point displaying the products unless it's an order form!
export default function MerchantPage({
	params,
}: {
	params: Promise<{
		merchantSlug: string
	}>
}) {
	const resolvedParams = use(params)
	const merchantSlug = resolvedParams.merchantSlug
	const [products, setProducts] = useState<BrowserSafeCustomerProduct[] | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')
	const [businessName, setBusinessName] = useState('')

	useEffect(() => {
		async function getData() {
			try {
				setIsLoading(true)

				const { availableProducts, message, businessName }: InventoryMerchantsMerchantSlugGETresponse = await (
					await fetch(urlJoin(apiPaths.inventory.merchants.base, merchantSlug), { credentials: 'include' })
				).json()

				if (availableProducts) setProducts(availableProducts)
				if (businessName) setBusinessName(businessName)

				if (!availableProducts && !businessName) setErrorMessage(message)
			} catch (error) {
				logger.error('unknown error: ', error)
			} finally {
				setIsLoading(false)
			}
		}
		getData()
	}, [merchantSlug])

	if (!products) {
		return (
			<>
				<h1>{businessName || merchantSlug}</h1>
				<p>This merchant hasn't added any products yet</p>
			</>
		)
	}

	function Products() {
		return (
			<ul className="flex flex-col w-full gap-y-4 max-w-xl -mx-3">
				{products?.map((product, index) => (
					<CustomerFacingProductCard key={product.id} product={product} zebraStripe={Boolean(index % 2)} />
				))}
			</ul>
		)
	}

	return (
		<>
			<BreadCrumbs
				home={'dashboard'}
				trail={[
					{
						displayName: 'Merchants',
						href: '/merchants',
					},
				]}
				currentPageTitle={businessName}
			/>
			<h1>{businessName}</h1>
			{errorMessage && <p>{errorMessage}</p>}
			{isLoading ? <Spinner /> : <Products />}
		</>
	)
}
