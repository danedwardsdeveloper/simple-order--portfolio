'use client'

import Link from 'next/link'

import { useUi } from '@/providers/ui'

export default function Page() {
  const { user } = useUi()
  if (!user) return null
  const merchants = user.merchantsAsCustomer?.map(id => id) || []

  function MerchantsList() {
    if (!merchants || merchants.length === 0) {
      return <span>No merchants found</span>
    }

    return (
      <>
        {merchants.map((merchant, index) => {
          return (
            <span
              key={index}
              className="block transition-colors duration-300 text-zinc-600 hover:text-blue-400 active:text-blue-500"
            >
              {merchant?.businessName}
            </span>
          )
        })}
      </>
    )
  }

  return (
    <>
      <h1>Merchants</h1>
      <div>{<MerchantsList />}</div>
    </>
  )
}
