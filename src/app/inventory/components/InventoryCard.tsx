'use client'

import clsx from 'clsx'
import { useState } from 'react'

import { formatPrice } from '@/library/utilities'

import { useAuthorisation } from '@/providers/authorisation'
import { useUi } from '@/providers/ui'
import { ClientProduct } from '@/types'

interface Props {
  product: ClientProduct
  zebraStripe: boolean
}

export default function InventoryCard({ product, zebraStripe }: Props) {
  const [isBeingEdited, setIsBeingEdited] = useState(false)
  const { includeVat } = useUi()
  const { temporaryHardCodedDefaultVAT } = useAuthorisation()

  const vatInteger = product.customVat ?? temporaryHardCodedDefaultVAT

  function DisplayPrice(): string {
    if (!includeVat) return formatPrice(product.priceInMinorUnits)
    const vatMultiplier = 1 + vatInteger / 100
    return formatPrice(product.priceInMinorUnits * vatMultiplier)
  }

  if (isBeingEdited) {
    return (
      <li className={clsx('flex flex-col gap-y-2 w-full p-3 rounded-xl', zebraStripe ? 'bg-blue-50' : 'bg-zinc-50')}>
        <h1>{`I'm being edited!`}</h1>
        <button type="button" onClick={() => setIsBeingEdited(false)} className="button-secondary">
          Cancel
        </button>
      </li>
    )
  }

  return (
    <li className={clsx('flex flex-col gap-y-2 w-full p-3 rounded-xl', zebraStripe ? 'bg-blue-50' : 'bg-zinc-50')}>
      <h3 className="text-xl font-medium mb-1">{product.name}</h3>
      <p className="text-zinc-700 max-w-prose">{product.description}</p>
      <div className="flex justify-between items-center">
        <div className="flex gap-x-1 items-center">
          <span className="text-lg">
            <DisplayPrice />
          </span>
          <span className="text-zinc-500 text-sm">{includeVat && `Including ${vatInteger}% VAT`}</span>
        </div>
        <button className="link" onClick={() => setIsBeingEdited(true)}>
          Edit
        </button>
      </div>
    </li>
  )
}
