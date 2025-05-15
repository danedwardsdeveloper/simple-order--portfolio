'use client'
import { epochDateToTimeInput, formatTime, timeInputToEpochDate } from '@/library/utilities/public'
import { useEffect, useState } from 'react'
import Setting from './Setting'

type Props = {
	cutOffTime: Date
	saveCutOffTime: (newValue: Date) => Promise<void>
	isBeingEdited: boolean
	setIsBeingEdited: (isEditing: boolean) => void
	isSubmitting: boolean
}

export default function CutOffTime({ cutOffTime, saveCutOffTime, isBeingEdited, setIsBeingEdited, isSubmitting }: Props) {
	const [newSetting, setNewSetting] = useState<Date | null>(null)

	useEffect(() => {
		if (isBeingEdited) {
			setNewSetting(cutOffTime)
		}
	}, [isBeingEdited, cutOffTime])

	useEffect(() => {
		if (newSetting !== null) {
			setNewSetting(newSetting)
		}
	}, [newSetting])

	function handleSave() {
		if (newSetting !== null) {
			saveCutOffTime(newSetting)
		} else {
			saveCutOffTime(cutOffTime)
		}
	}

	return (
		<Setting
			title="Order cut off time"
			onSave={handleSave}
			isBeingEdited={isBeingEdited}
			setIsBeingEdited={setIsBeingEdited}
			isSubmitting={isSubmitting}
			hasChanges={newSetting !== cutOffTime}
			content={<span>{formatTime(cutOffTime)}</span>}
			editContent={
				<input
					type="time"
					id="cutOffTime"
					value={epochDateToTimeInput(newSetting || cutOffTime)}
					onChange={(event) => {
						const timeInputValue = event.target.value
						const updatedDate = timeInputToEpochDate(timeInputValue)
						setNewSetting(updatedDate)
					}}
				/>
			}
		/>
	)
}
