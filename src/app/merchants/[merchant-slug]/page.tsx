import { use } from 'react'

import { MerchantProfile, User, users } from '@/library/tempData/users'

import OrderSummaryPage from './components/OrderSummaryPage'

export async function generateStaticParams() {
  return users.merchants
    .filter((user): user is User & { merchantProfile: MerchantProfile } => {
      return user.merchantProfile !== undefined
    })
    .map(user => ({
      slug: user.merchantProfile.slug,
    }))
}

type Props = {
  params: Promise<{
    'merchant-slug': string
  }>
}

export default function MerchantPage({ params }: Props) {
  const resolvedParams = use(params)
  const merchantSlug = resolvedParams['merchant-slug']
  const merchant = users.merchants.find(
    (user): user is User & { merchantProfile: MerchantProfile } =>
      user.merchantProfile !== undefined && user.merchantProfile.slug === merchantSlug,
  )

  if (!merchant) {
    return <div>Merchant not found</div>
  }

  return <OrderSummaryPage />
}
