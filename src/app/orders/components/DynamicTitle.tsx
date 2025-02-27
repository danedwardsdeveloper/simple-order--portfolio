'use client'
import { useUi } from '@/providers/ui'
import { useUser } from '@/providers/user'

export default function DynamicTitle() {
	const { user } = useUser()
	const { merchantMode } = useUi()

	if (!user) return null

	let title = 'Orders'

	if (user)
		if (user?.roles === 'both') {
			title = merchantMode ? 'Orders made' : 'Orders received'
		}

	return <h1>{title}</h1>
}
