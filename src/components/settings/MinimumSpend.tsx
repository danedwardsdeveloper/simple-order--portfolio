'use client'
import { formatPrice } from '@/library/utilities/public'
import type { SettingsContextType } from '@/types'
import SettingForm from './Setting'

type Props = {
	minimumSpendPence: number
	saveMinimumSpendPence: SettingsContextType['saveMinimumSpendPence']
}

export default function MinimumSpend({ minimumSpendPence, saveMinimumSpendPence }: Props) {
	return (
		<SettingForm
			title="Minimum spend"
			initialValue={minimumSpendPence}
			onSave={saveMinimumSpendPence}
			renderView={(value) => <span>{formatPrice(value)}</span>}
			renderEdit={(value, onChange) => (
				<input
					type="number"
					min="0"
					step="1"
					className="w-24 px-2 py-1 border rounded"
					value={value || 0}
					onChange={(event) => {
						const newValue = Number.parseInt(event.target.value, 10)
						onChange(newValue)
					}}
				/>
			)}
		/>
	)
}
