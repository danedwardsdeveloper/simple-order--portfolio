'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import OrderSummaryList from './OrdersSummaryList'
import { useUi } from '@/providers/ui'

export default function OrderSummaryPage() {
  const { uiSignedIn, user } = useUi()
  const router = useRouter()

  useEffect(() => {
    if (!uiSignedIn) {
      router.push('/')
    }
  }, [uiSignedIn, router])

  if (!uiSignedIn || !user) {
    return null
  }

  return (
    <>
      <OrderSummaryList />
    </>
  )
}
