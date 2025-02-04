'use client'

import clsx from 'clsx'
import { useState } from 'react'

import { Product } from '@/library/database/schema'
import { formatPrice } from '@/library/utilities'

import { useUi } from '@/providers/ui'

interface Props {
  product: Product
  zebraStripe: boolean
}

export default function InventoryCard({ product, zebraStripe }: Props) {
  const [isBeingEdited, setIsBeingEdited] = useState(false)
  const { includeVat } = useUi()

  function calculateDisplayPrice(basePrice: number, vat: number = 0): string {
    if (includeVat) {
      return formatPrice(basePrice * (1 + vat / 100))
    } else {
      return formatPrice(basePrice)
    }
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
      <div className="flex gap-x-4 items-center">
        <h3 className="text-xl font-medium mb-1">{product.name}</h3>
        <span className="text-zinc-400">{product.sku}</span>
      </div>
      <p className="text-zinc-700 max-w-prose">{product.description}</p>
      <div className="flex justify-between items-center">
        <div className="flex gap-x-1 items-center">
          <span className="text-lg">{calculateDisplayPrice(product.priceInMinorUnits, product.customVat)}</span>
          <span className="text-zinc-500 text-sm">{includeVat && `Including ${product.customVat}% VAT`}</span>
        </div>
        <button className="link" onClick={() => setIsBeingEdited(true)}>
          Edit
        </button>
      </div>
    </li>
  )
}
