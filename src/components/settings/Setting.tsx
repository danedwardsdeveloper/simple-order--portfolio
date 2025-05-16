'use client'
import type { ReactNode } from 'react'
import Spinner from '../Spinner'
import { type SettingFormConfig, SettingProvider, useSettingForm } from '../providers/settingForm'

type Props<T> = SettingFormConfig<T> & {
	title: string
	renderView: (value: T) => ReactNode
	renderEdit: (value: T, onChange: (value: T) => void) => ReactNode
}

export default function Setting<T>({ title, initialValue, onSave, isEqual, renderView, renderEdit }: Props<T>) {
	const { isEditing, isSubmitting, draftValue, setDraftValue, hasChanges, startEditing, cancelEditing, handleSave } = useSettingForm({
		initialValue,
		onSave,
		isEqual,
	})

	const contextValue = {
		title,
		isEditing,
		isSubmitting,
		hasChanges,
		startEditing,
		cancelEditing,
		handleSave,
	}

	return (
		<SettingProvider value={contextValue}>
			<div>
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
				<div className="min-h-14">{isEditing ? renderEdit(draftValue, setDraftValue) : renderView(initialValue)}</div>
			</div>
		</SettingProvider>
	)
}
