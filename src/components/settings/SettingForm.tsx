'use client'
import { InformationCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { type ReactNode, useState } from 'react'
import Spinner from '../Spinner'
import { type SettingFormConfig, SettingProvider, useSettingForm } from '../providers/settingForm'

type Props<T> = SettingFormConfig<T> & {
	title: string
	helpText: ReactNode
	renderView: (value: T) => ReactNode
	renderEdit: (value: T, onChange: (value: T) => void) => ReactNode
}

export default function SettingForm<T>({ title, helpText, initialValue, onSave, isEqual, renderView, renderEdit }: Props<T>) {
	const [showInformation, setShowInformation] = useState(false)
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
					<div className="flex items-center gap-x-2 mb-2">
						<p className="font-medium">{title}</p>
						{showInformation ? (
							<XCircleIcon
								tabIndex={0}
								onKeyDown={(event) => {
									if (event.key === 'Enter' || event.key === ' ') {
										event.preventDefault()
										setShowInformation(false)
									}
								}}
								onClick={() => setShowInformation(false)}
								aria-label="Close additional information panel"
								className="size-6 hover:bg-red-50 rounded-md transition-colors duration-300 text-red-400"
							/>
						) : (
							<InformationCircleIcon
								tabIndex={0}
								onKeyDown={(event) => {
									if (event.key === 'Enter' || event.key === ' ') {
										event.preventDefault()
										setShowInformation(true)
									}
								}}
								onClick={() => setShowInformation(true)}
								aria-label="Open additional information panel"
								className={
									'size-6 text-zinc-600 hover:text-blue-600 hover:bg-blue-100 active:text-blue-700 rounded-md transition-colors duration-300'
								}
							/>
						)}
					</div>
					{isEditing ? (
						<div className="flex gap-x-2">
							<button type="button" onClick={cancelEditing} className="button-secondary">
								Cancel
							</button>
							{hasChanges && (
								<button type="button" onClick={handleSave} className="button-primary">
									<div className="min-h-7 min-w-[4ch] flex justify-center">{isSubmitting ? <Spinner colour="text-white" /> : 'Save'}</div>
								</button>
							)}
						</div>
					) : (
						<button type="button" onClick={startEditing} className="link-primary">
							Edit
						</button>
					)}
				</div>
				{showInformation && <div className="bg-blue-50 border-2 border-blue-100 rounded-md p-2 mb-2 flex flex-col gap-y-3">{helpText}</div>}
				<div className="min-h-14">
					{isEditing
						? //
							renderEdit(draftValue, setDraftValue)
						: renderView(initialValue)}
				</div>
			</div>
		</SettingProvider>
	)
}
