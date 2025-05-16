'use client'
import { epochDateToTimeInput, formatTime, timeInputToEpochDate } from '@/library/utilities/public'
import type { SettingsContextType } from '@/types'
import SettingForm from './Setting'

type Props = {
	cutOffTime: Date
	saveCutOffTime: SettingsContextType['saveCutOffTime']
}

export default function CutOffTime({ cutOffTime, saveCutOffTime }: Props) {
	return (
		<SettingForm
			title="Order cut off time"
			initialValue={cutOffTime}
			onSave={saveCutOffTime}
			renderView={(value) => <span>{formatTime(value)}</span>}
			renderEdit={(value, onChange) => (
				<input
					type="time"
					id="cutOffTime"
					value={epochDateToTimeInput(value)}
					onChange={(event) => {
						const timeInputValue = event.target.value
						const updatedDate = timeInputToEpochDate(timeInputValue)
						onChange(updatedDate)
					}}
				/>
			)}
		/>
	)
}
