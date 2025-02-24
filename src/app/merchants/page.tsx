'use client'

import Spinner from '@/components/Spinner'
import UnauthorisedLinks from '@/components/UnauthorisedLinks'
import { apiPaths } from '@/library/constants'
import logger from '@/library/logger'
import { useUser } from '@/providers/user'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { MerchantsGETresponse } from '../api/merchants/route'

export default function Page() {
	const { user, confirmedMerchants, setConfirmedMerchants, pendingMerchants, setPendingMerchants } = useUser()
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		async function getMerchants() {
			try {
				setLoading(true)
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
			} finally {
				setLoading(false)
			}
		}

		if (user) getMerchants()
	}, [user, setConfirmedMerchants, setPendingMerchants])

	if (!user) return <UnauthorisedLinks />

	if (loading) {
		return <Spinner />
	}

	if (!confirmedMerchants?.length && !pendingMerchants?.length) {
		return <span>No merchants found</span>
	}

	return (
		<>
			<h1>Merchants</h1>

			{confirmedMerchants &&
				confirmedMerchants?.length > 0 &&
				confirmedMerchants.map((merchant) => (
					<Link key={merchant.slug} href={`/merchants/${merchant.slug}`} className="link-primary">
						{merchant.businessName}
					</Link>
				))}

			{pendingMerchants && pendingMerchants?.length > 0 && (
				<>
					<h2>Invitations</h2>
					{pendingMerchants.map((merchant) => (
						<span
							key={merchant.slug}
							className="block transition-colors duration-300 text-zinc-600 hover:text-blue-400 active:text-blue-500"
						>
							{merchant.businessName}
						</span>
					))}
				</>
			)}
		</>
	)
}
