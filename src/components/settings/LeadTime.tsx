'use client'
import SettingForm from './Setting'

type Props = {
	leadTimeDays: number
	saveLeadTime: (newValue: number) => Promise<void>
}

export default function LeadTime({ leadTimeDays, saveLeadTime }: Props) {
	return (
		<SettingForm
			title="Lead time"
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
