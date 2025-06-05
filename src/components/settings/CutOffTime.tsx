'use client'
import { epochDateToTimeInput, formatTime, timeInputToEpochDate } from '@/library/utilities/public'
import type { SettingsContextType } from '@/types'
import SettingForm from './SettingForm'

type Props = {
	cutOffTime: Date
	saveCutOffTime: SettingsContextType['saveCutOffTime']
}

export default function CutOffTime({ cutOffTime, saveCutOffTime }: Props) {
	return (
		<SettingForm
			title="Order cut off time"
			helpText="The latest time each day that customers can place orders for the next available delivery day. For example, if you deliver orders Monday to Friday, your lead time is one day, and your cut off time is 6pm, customers will be able to place an order as late as 5:59pm on a Monday and expect to receive it on Tuesday."
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
