'use client'
import { formatPrice } from '@/library/utilities/public'
import { useEffect, useState } from 'react'
import Setting from './Setting'

type Props = {
	minimumSpendPence: number
	saveMinimumSpendPence: (newValue: number) => Promise<void>
	isBeingEdited: boolean
	setIsBeingEdited: (isEditing: boolean) => void
	isSubmitting: boolean
}

export default function MinimumSpend({ minimumSpendPence, saveMinimumSpendPence, setIsBeingEdited, isBeingEdited, isSubmitting }: Props) {
	const [newSetting, setNewSetting] = useState<number | null>(null)

	useEffect(() => {
		if (isBeingEdited) {
			setNewSetting(minimumSpendPence)
		}
	}, [isBeingEdited, minimumSpendPence])

	useEffect(() => {
		if (newSetting !== null) {
			setNewSetting(newSetting)
		}
	}, [newSetting])

	return (
		<Setting
			title="Minimum spend"
			onSave={() => saveMinimumSpendPence(newSetting || 0)}
			isBeingEdited={isBeingEdited}
			setIsBeingEdited={setIsBeingEdited}
			isSubmitting={isSubmitting}
			hasChanges={newSetting !== minimumSpendPence}
			content={<span>{formatPrice(minimumSpendPence)}</span>}
			editContent={
				<input
					type="number"
					min="0"
					step="1"
					className="w-24 px-2 py-1 border rounded"
					value={newSetting !== null ? newSetting : minimumSpendPence || 0}
					onChange={(event) => {
						const value = Number.parseInt(event.target.value, 10)
						setNewSetting(value)
					}}
				/>
			}
		/>
	)
}
