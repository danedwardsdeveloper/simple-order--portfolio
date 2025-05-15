'use client'
import Spinner from '@/components/Spinner'
import type { ReactNode } from 'react'
import { useSetting } from './SettingContext'

export function SettingHeader() {
	const { title, isEditing, startEditing, cancelEditing, handleSave, hasChanges, isSubmitting } = useSetting()

	return (
		<div className="flex justify-between items-start">
			<p className="font-medium mb-2">{title}</p>
			{isEditing ? (
				<div className="flex gap-x-2">
					<button type="button" onClick={cancelEditing} className="link-primary">
						Cancel
					</button>
					{hasChanges && (
						<button type="button" onClick={handleSave} className="px-2 py-1 bg-blue-300 rounded">
							{isSubmitting ? <Spinner colour="text-white" /> : 'Save'}
						</button>
					)}
				</div>
			) : (
				<button type="button" onClick={startEditing} className="link-primary">
					Edit
				</button>
			)}
		</div>
	)
}

export function SettingContent({
	viewMode,
	editMode,
}: {
	viewMode: ReactNode
	editMode: ReactNode
}) {
	const { isEditing } = useSetting()

	return <div className="min-h-14">{isEditing ? editMode : viewMode}</div>
}

export default function Setting({
	children,
}: {
	children: ReactNode
}) {
	return (
		<div>
			<SettingHeader />
			{children}
		</div>
	)
}
