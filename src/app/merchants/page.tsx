'use client'

import Link from 'next/link'

import { findUserById } from '@/library/tempData/users'

import { useUi } from '@/providers/ui'

export default function Page() {
  const { user } = useUi()
  if (!user) return null
  const merchants = user.merchantIds?.map(id => findUserById(id)?.merchantProfile) || []
  if (!merchants || merchants.length === 0) return null

  return (
    <>
      <h1>Merchants</h1>
      <div>
        {merchants.map((merchant, index) => {
          return (
            <Link
              key={index}
              href={`/merchants/${merchant?.slug}`}
              className="block transition-colors duration-300 text-zinc-600 hover:text-blue-400 active:text-blue-500"
            >
              {merchant?.businessName}
            </Link>
          )
        })}
      </div>
    </>
  )
}
