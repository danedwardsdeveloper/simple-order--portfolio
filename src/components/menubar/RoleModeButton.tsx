'use client'
import { useUi } from '@/components/providers/ui'
import { useUser } from '@/components/providers/user'
import ToggleWithLabel from '../ToggleWithLabel'

export default function RoleModeButton() {
	const { user } = useUser()
	const { merchantMode, toggleMerchantMode } = useUi()

	if (user?.roles !== 'both') return null

	return (
		<div className="px-4 pt-2 pb-8 rounded-xl bg-blue-50 flex flex-col gap-y-4 text-center max-w-xl items-center">
			<h2>Mode</h2>
			<ToggleWithLabel
				enabled={merchantMode}
				setEnabled={() => toggleMerchantMode()}
				enabledLabel="Merchant mode"
				disabledLabel="Customer mode"
			/>
		</div>
	)
}
