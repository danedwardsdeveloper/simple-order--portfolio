'use client'
import type { SettingsContextType } from '@/types'
import SettingForm from './SettingForm'

type Props = {
	leadTimeDays: number
	saveLeadTime: SettingsContextType['saveLeadTime']
}

export default function LeadTime({ leadTimeDays, saveLeadTime }: Props) {
	return (
		<SettingForm
			title="Lead time"
			helpText="How many days' notice you need to prepare an order. For example, set it to 0 if you accept same-day orders, or set to 1 if you fulfill orders the day after they're placed."
			initialValue={leadTimeDays}
			onSave={saveLeadTime}
			renderView={(value) => <span>{`${value || 0} day${value !== 1 ? 's' : ''}`}</span>}
			renderEdit={(value, onChange) => (
				<input
					type="number"
					min="0"
					className="w-16 px-2 py-1 border rounded"
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
