'use client'
import BreadCrumbs from '@/components/BreadCrumbs'
import UnauthorisedLinks from '@/components/UnauthorisedLinks'
import { apiPaths } from '@/library/constants'
import logger from '@/library/logger'
import { useUser } from '@/providers/user'
import Link from 'next/link'
import { useEffect } from 'react'
import type { MerchantsGETresponse } from '../api/merchants/route'

// Customer view of a list of merchants the signed-in user is subscribed to
export default function MerchantsPage() {
	const { user, confirmedMerchants, setConfirmedMerchants, pendingMerchants, setPendingMerchants } = useUser()

	useEffect(() => {
		async function getMerchants() {
			try {
				const response = await fetch(apiPaths.merchants.base, { credentials: 'include' })
				const { confirmedMerchants, pendingMerchants, message }: MerchantsGETresponse = await response.json()

				if (confirmedMerchants) {
					setConfirmedMerchants(confirmedMerchants)
				}

				if (pendingMerchants) {
					setPendingMerchants(pendingMerchants)
				}

				if (message !== 'success') {
					logger.error('merchants/page.tsx error: ', message)
				}
			} catch (error) {
				logger.error('merchants/page.tsx error: ', error)
			}
		}

		if (user) getMerchants()
	}, [user, setConfirmedMerchants, setPendingMerchants])

	if (!user) return <UnauthorisedLinks />

	if (!confirmedMerchants?.length && !pendingMerchants?.length) {
		return <span>No merchants found</span>
	}

	// ToDo: Don't show 'Place an order' links for merchants with no products

	return (
		<>
			<h1>Merchants</h1>
			<BreadCrumbs home={'dashboard'} currentPageTitle="Merchants" />

			{confirmedMerchants &&
				confirmedMerchants?.length > 0 &&
				confirmedMerchants.map((merchant) => (
					<div key={merchant.slug} className="flex gap-x-2 items-end">
						<h2>{merchant.businessName}</h2>
						<Link href={`/merchants/${merchant.slug}`} className="link-primary">
							Place an order
						</Link>
					</div>
				))}
			{/* ToDo: This should be pendingInvitations (as in a merchant has invited you...) */}
			{/* ToDo: Handle empty arrays consistently */}
			{pendingMerchants && pendingMerchants?.length > 0 && (
				<div>
					{pendingMerchants.map((merchant) => (
						<div key={merchant.slug}>
							<span className="block transition-colors duration-300 text-zinc-600 hover:text-blue-400 active:text-blue-500">
								{merchant.businessName}
							</span>
						</div>
					))}
				</div>
			)}
		</>
	)
}
