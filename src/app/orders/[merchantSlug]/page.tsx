'use client'
import { SignedInBreadCrumbs } from '@/components/BreadCrumbs'
import { useUser } from '@/components/providers/user'
import { use } from 'react'

export type MerchantSlugResolvedParams = { merchantSlug: string }
export type MerchantSlugParams = { params: Promise<MerchantSlugResolvedParams> }

export default function Page({ params }: MerchantSlugParams) {
	const merchantSlug = use(params).merchantSlug

	const { user, confirmedMerchants } = useUser()

	const merchantDetails = confirmedMerchants?.find((merchant) => merchant.slug === merchantSlug)

	if (!user) return null

	return (
		<>
			<SignedInBreadCrumbs
				businessName={user.businessName}
				trail={[{ displayName: 'Orders', href: '/orders' }]}
				currentPageTitle={merchantDetails?.businessName || merchantSlug}
			/>
			<p>ToDo: Customer-facing page showing all orders from a specific merchant</p>
		</>
	)
}
