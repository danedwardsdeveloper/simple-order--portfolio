'use client'
import type { InventoryMerchantsMerchantSlugGETresponse } from '@/app/api/inventory/merchants/[merchantSlug]/route'
import type { MerchantSlugGETresponse } from '@/app/api/merchants/[merchantId]/route'
import Spinner from '@/components/Spinner'
import { apiPaths } from '@/library/constants'
import logger from '@/library/logger'
import type { BrowserSafeCustomerProduct } from '@/types'
import { use, useEffect, useState } from 'react'
import urlJoin from 'url-join'
import ProductCardForCustomer from './components/ProductCardForCustomer'

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
			// ToDo: get merchant data using slug, then use Promise.all to get both responses
			try {
				setIsLoading(true)

				const productsURL = urlJoin(apiPaths.inventory.merchants.base, merchantSlug)

				const businessNameURL = urlJoin(apiPaths.merchants.base, merchantSlug)

				const [productsResponse, businessNameResponse] = await Promise.all([
					fetch(productsURL, { credentials: 'include' }),
					fetch(businessNameURL, { credentials: 'include' }),
				])

				const productsData: InventoryMerchantsMerchantSlugGETresponse = await productsResponse.json()
				const businessData: MerchantSlugGETresponse = await businessNameResponse.json()

				// 3. Destructure with clear naming
				const { availableProducts } = productsData
				const { merchantBusinessName } = businessData

				if (availableProducts) setProducts(availableProducts)
				if (merchantBusinessName) setBusinessName(merchantBusinessName)

				if (productsData.message !== 'success') setErrorMessage(productsData.message)
				if (businessData.message !== 'success') setErrorMessage(productsData.message)
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
				<p>No products</p>
			</>
		)
	}

	function Products() {
		return (
			<ul className="flex flex-col w-full gap-y-4 max-w-xl -mx-3">
				{products?.map((product, index) => (
					<ProductCardForCustomer key={product.id} product={product} zebraStripe={Boolean(index % 2)} />
				))}
			</ul>
		)
	}

	return (
		<>
			<h1>{businessName}</h1>
			{errorMessage && <p>{errorMessage}</p>}
			{isLoading ? <Spinner /> : <Products />}
		</>
	)
}
