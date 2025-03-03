'use client'
import type { MerchantsGETresponse } from '@/app/api/merchants/route'
import UnauthorisedLinks from '@/components/UnauthorisedLinks'
import { apiPaths } from '@/library/constants'
import logger from '@/library/logger'
import { useUser } from '@/providers/user'
import Link from 'next/link'
import { useEffect } from 'react'

// Customer view of a list of merchants the signed-in user is subscribed to
export default function MerchantsList() {
	const { user, confirmedMerchants, setConfirmedMerchants, hasAttemptedMerchantsFetch, setHasAttemptedMerchantsFetch } = useUser()

	// biome-ignore lint/correctness/useExhaustiveDependencies:
	useEffect(() => {
		async function getMerchants() {
			try {
				const { confirmedMerchants, message }: MerchantsGETresponse = await await (
					await fetch(apiPaths.merchants.base, { credentials: 'include' })
				).json()

				logger.debug('Confirmed merchants: ', confirmedMerchants)

				setConfirmedMerchants(confirmedMerchants || null)

				if (message !== 'success') logger.error('merchants/page.tsx error: ', message)
			} catch (error) {
				logger.error('merchants/page.tsx error: ', error)
			} finally {
				setHasAttemptedMerchantsFetch(true)
			}
		}

		if (user && !hasAttemptedMerchantsFetch) getMerchants()
	}, [user, setConfirmedMerchants])

	if (!user) return <UnauthorisedLinks />

	if (!confirmedMerchants) {
		return <span>No merchants found</span>
	}

	// ToDo: Don't show 'Place an order' links for merchants with no products

	return (
		<>
			<h2>Merchants</h2>
			{confirmedMerchants.map((merchant) => (
				<div key={merchant.slug} className="flex gap-x-2 items-end">
					<h3>{merchant.businessName}</h3>
					<Link href={`/merchants/${merchant.slug}`} className="link-primary">
						Place an order
					</Link>
				</div>
			))}
		</>
	)
}
