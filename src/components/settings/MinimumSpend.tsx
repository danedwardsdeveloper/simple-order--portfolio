'use client'
import { formatPrice } from '@/library/utilities/public'
import type { SettingsContextType } from '@/types'
import { useUi } from '../providers/ui'
import SettingForm from './SettingForm'

type Props = {
	minimumSpendPence: number
	saveMinimumSpendPence: SettingsContextType['saveMinimumSpendPence']
}

export default function MinimumSpend({ minimumSpendPence, saveMinimumSpendPence }: Props) {
	const { currency } = useUi()
	return (
		<SettingForm
			title="Minimum spend"
			helpText="The smallest order value you'll accept, excluding VAT. Customers won't be able to make orders below this amount."
			initialValue={minimumSpendPence}
			onSave={saveMinimumSpendPence}
			renderView={(value) => <span>{formatPrice(value, currency)}</span>}
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
