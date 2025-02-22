'use client'
import { useUi } from '@/providers/ui'
import ToggleWithLabel from '../ToggleWithLabel'

export default function RoleModeButton() {
	const { merchantMode, toggleMerchantMode } = useUi()

	// ToDo: hide this if the user only has one role

	return (
		<div className="px-4 pt-2 pb-8 rounded-xl bg-blue-50 flex flex-col gap-y-4 text-center">
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
