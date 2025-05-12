'use client'
import type { ReactNode } from 'react'
import { type EditingState, useMerchantSettings } from './MerchantSettingsProvider'

export default function Setting<K extends keyof EditingState>({
	title,
	editKey,
	editContent,
	content,
	hasChanges,
	onSave,
}: {
	title: string
	editKey: K
	hasChanges: boolean
	onSave: () => void
	content: ReactNode
	editContent: ReactNode
}) {
	const { isEditing, setIsEditing } = useMerchantSettings()
	const isBeingEdited = isEditing[editKey]

	function toggleEdit() {
		setIsEditing((prev) => ({ ...prev, [editKey]: !prev[editKey] }))
	}

	return (
		<div>
			<div className="flex justify-between items-start">
				<p className="font-medium mb-2">{title}</p>
				{isBeingEdited ? (
					<div className="flex gap-x-2">
						<button type="button" onClick={toggleEdit} className="link-primary">
							Cancel
						</button>
						{hasChanges && (
							<button type="button" onClick={onSave} className="px-2 py-1 bg-blue-300 rounded">
								Save
							</button>
						)}
					</div>
				) : (
					<button type="button" onClick={toggleEdit} className="link-primary">
						Edit
					</button>
				)}
			</div>
			<div className="min-h-14">{isBeingEdited ? editContent : content}</div>
		</div>
	)
}
