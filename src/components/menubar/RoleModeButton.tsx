'use client'

import { useUi } from '@/providers/ui'

export default function RoleModeButton() {
	const { user, merchantMode, toggleMerchantMode } = useUi()

	if (!user) return null

	function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
		event.preventDefault()
		toggleMerchantMode()
	}

	return (
		<button onClick={handleClick} className="text-sm text-zinc-500 hover:text-zinc-400 active:text-zinc-300 transition-colors duration-300">
			{merchantMode ? 'Switch to customer mode' : 'Switch to merchant mode'}
		</button>
	)
}
