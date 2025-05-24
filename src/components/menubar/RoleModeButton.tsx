'use client'
import { useUi } from '@/components/providers/ui'
import ToggleWithLabel from '../ToggleWithLabel'

export function RoleModeToggle() {
	const { merchantMode, toggleMerchantMode } = useUi()

	return (
		<ToggleWithLabel
			enabled={merchantMode}
			setEnabled={() => toggleMerchantMode()}
			enabledLabel="Merchant mode"
			disabledLabel="Customer mode"
		/>
	)
}

export function RoleModeToggleSection() {
	return (
		<div
			data-component="RoleModeToggleSection"
			className="px-4 pt-2 pb-8 rounded-xl bg-blue-50 flex flex-col gap-y-4 text-center max-w-xl items-center"
		>
			<h2>Mode</h2>
			<RoleModeToggle />
		</div>
	)
}
