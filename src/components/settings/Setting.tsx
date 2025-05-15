'use client'
import Spinner from '@/components/Spinner'
import type { ReactNode } from 'react'

export default function Setting({
	title,
	isBeingEdited,
	setIsBeingEdited,
	isSubmitting,
	hasChanges,
	content,
	editContent,
	onSave,
}: {
	title: string
	isBeingEdited: boolean
	setIsBeingEdited: (isEditing: boolean) => void
	hasChanges: boolean
	onSave: () => void
	isSubmitting: boolean
	content: ReactNode
	editContent: ReactNode
}) {
	const toggleEdit = () => {
		setIsBeingEdited(!isBeingEdited)
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
								{isSubmitting ? <Spinner colour="text-white" /> : 'Save'}
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
