'use client'
import { useAuthorisation } from '@/providers/authorisation'
import { useUi } from '@/providers/ui'
import type { MouseEvent } from 'react'

export default function RoleModeButton() {
	const { merchantMode, toggleMerchantMode } = useUi()
	const { clientSafeUser } = useAuthorisation()

	if (!clientSafeUser) return null

	function handleClick(event: MouseEvent<HTMLButtonElement>) {
		event.preventDefault()
		toggleMerchantMode()
	}

	return (
		<button
			type="button"
			onClick={handleClick}
			className="text-sm text-zinc-500 hover:text-zinc-400 active:text-zinc-300 transition-colors duration-300"
		>
			{merchantMode ? 'Switch to customer mode' : 'Switch to merchant mode'}
		</button>
	)
}
