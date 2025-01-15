import { use } from 'react'

import { allMerchants } from '@/library/tempData/users'

import OrderSummaryPage from './components/OrderSummaryPage'

export async function generateStaticParams() {
  const merchantSlugs = Object.values(allMerchants)
    .filter(user => user.merchantProfile?.slug)
    .map(user => ({
      'merchant-slug': user.merchantProfile!.slug,
    }))

  return merchantSlugs
}

type Props = {
  params: Promise<{
    'merchant-slug': string
  }>
}

export default function MerchantPage({ params }: Props) {
  const resolvedParams = use(params)
  const merchantSlug = resolvedParams['merchant-slug']
  const merchant = Object.values(allMerchants).find(user => user.merchantProfile?.slug === merchantSlug)

  if (!merchant) {
    return <div>Merchant not found</div>
  }

  return <OrderSummaryPage />
}
