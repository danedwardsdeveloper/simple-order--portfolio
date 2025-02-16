'use client'

import Link from 'next/link'

import { useAuthorisation } from '@/providers/authorisation'

export default function EmptyInventoryMessage() {
	const { clientSafeUser } = useAuthorisation()

	if (!clientSafeUser || clientSafeUser.inventory) return null

	return (
		<div className="max-w-prose p-3 my-4 border-2 rounded-xl border-blue-300 ">
			<Link href="/inventory" className="text-blue-500 hover:text-blue-600 active:text-blue-700 transition-colors duration-300">
				Add items to your inventory
			</Link>
		</div>
	)
}
