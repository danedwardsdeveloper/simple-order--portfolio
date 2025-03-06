'use client'
import type { InventoryAdminGETresponse } from '@/app/api/inventory/admin/route'
import { apiPaths } from '@/library/constants'
import logger from '@/library/logger'
import { useNotifications } from '@/providers/notifications'
import { useUser } from '@/providers/user'
import { useEffect, useState } from 'react'
import InventoryCard from './InventoryCard'
import SkeletonCard from './SkeletonCard'

export default function InventoryList() {
	const { inventory, setInventory, hasAttemptedInventoryFetch, setHasAttemptedInventoryFetch } = useUser()
	const [isLoading, setIsLoading] = useState(false)
	const { createNotification } = useNotifications()

	// biome-ignore lint/correctness/useExhaustiveDependencies: <>
	useEffect(() => {
		async function getInventory() {
			try {
				setIsLoading(true)
				const { inventory, message }: InventoryAdminGETresponse = await (
					await fetch(apiPaths.inventory.merchantPerspective.base, { credentials: 'include' })
				).json()

				logger.debug('Inventory: ', inventory)
				logger.debug('Message: ', message)

				if (inventory) setInventory(inventory)
				if (message !== 'success')
					createNotification({
						level: 'error',
						title: 'Error',
						message: "Couldn't add product to inventory - please try again.",
					})
			} catch {
				createNotification({
					level: 'error',
					title: 'Error',
					message: "Couldn't add product to inventory - please try again.",
				})
			} finally {
				setHasAttemptedInventoryFetch(true)
				setIsLoading(false)
			}
		}
		if (!hasAttemptedInventoryFetch) getInventory()
	}, [])

	if (!inventory) return null

	if (isLoading)
		return (
			<ul className="flex flex-col w-full gap-y-4 max-w-xl md:-mx-3">
				{[0, 1, 2, 3, 4, 5].map((skeleton) => (
					<SkeletonCard key={skeleton} zebraStripe={Boolean(skeleton % 2)} />
				))}
			</ul>
		)

	return (
		<ul className="flex flex-col w-full gap-y-4 max-w-xl md:-mx-3">
			{inventory?.map((product, index) => (
				<InventoryCard key={product.id} product={product} zebraStripe={Boolean(index % 2)} />
			))}
		</ul>
	)
}
