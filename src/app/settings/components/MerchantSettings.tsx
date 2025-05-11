'use client'
import type { SettingsGETresponse } from '@/app/api/settings/get'
import type { SettingsPATCHbody, SettingsPATCHresponse } from '@/app/api/settings/patch'
import { useNotifications } from '@/components/providers/notifications'
import { useUser } from '@/components/providers/user'
import { daysOfTheWeek, userMessages } from '@/library/constants'
import {
	apiRequest,
	containsItems,
	epochDateToTimeInput,
	formatDate,
	formatDateFull,
	formatPrice,
	formatTime,
	timeInputToEpochDate,
} from '@/library/utilities/public'
import type { DayOfTheWeek, Holiday } from '@/types'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { differenceInCalendarDays, isSameDay } from 'date-fns'
import { produce } from 'immer'
import { type ReactNode, useEffect, useRef, useState } from 'react'

export function MerchantSettings() {
	const { user, setUser } = useUser()
	const { createNotification } = useNotifications()
	const [isEditing, setIsEditing] = useState<{
		cutOff: boolean
		leadTime: boolean
		holidays: boolean
		acceptedDeliveryDays: boolean
		minimumSpend: boolean
		generic: boolean
	}>({
		generic: false,
		cutOff: false,
		leadTime: false,
		acceptedDeliveryDays: false,
		holidays: false,
		minimumSpend: false,
	})

	const [newCutOff, setNewCutOff] = useState<Date>(user?.cutOffTime || new Date())
	const [newLeadTime, setNewLeadTime] = useState<number>(user?.leadTimeDays ?? 0)

	const [acceptedDeliveryDays, setAcceptedDeliveryDays] = useState<DayOfTheWeek[] | null>(null)
	const [holidays, setHolidays] = useState<Holiday[] | null>(null)

	// Prevent repeat fetching in development
	const settingsFetched = useRef(false)

	useEffect(() => {
		async function fetchSettings() {
			const { ok, holidays, acceptedDeliveryDays } = await apiRequest<SettingsGETresponse>({
				basePath: '/settings',
			})

			if (!ok) {
				// createNotification
			}

			if (holidays) {
				setHolidays(holidays)
			}

			if (acceptedDeliveryDays) {
				setAcceptedDeliveryDays(acceptedDeliveryDays)
			}
		}

		if (!settingsFetched.current) {
			fetchSettings()
			settingsFetched.current = true
		}
	}, [])

	if (!user || user.roles === 'customer' || !user.cutOffTime) return null

	async function saveSettings(type: 'cutOffTime' | 'leadTimeDays') {
		let body: SettingsPATCHbody
		if (type === 'cutOffTime') {
			if (!newCutOff) return null
			body = { cutOffTime: newCutOff }
		} else {
			body = { leadTimeDays: newLeadTime }
		}

		try {
			const { ok, userMessage } = await apiRequest<SettingsPATCHresponse, SettingsPATCHbody>({
				basePath: '/settings',
				method: 'PATCH',
				body,
			})

			if (ok) {
				setUser(
					produce((prevUser) => {
						if (!prevUser) return prevUser

						if (type === 'cutOffTime' && newCutOff) {
							prevUser.cutOffTime = newCutOff
						} else if (type === 'leadTimeDays') {
							prevUser.leadTimeDays = newLeadTime
						}
					}),
				)

				createNotification({
					title: 'Success',
					level: 'success',
					message: 'Settings updated',
				})
			}

			if (userMessage) {
				createNotification({
					title: 'Error',
					level: 'error',
					message: userMessage,
				})
			}
		} catch {
			createNotification({
				title: 'Error',
				level: 'error',
				message: userMessages.serverError,
			})
		}
	}

	function Setting<K extends keyof typeof isEditing>({
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
		const isBeingEdited = isEditing[editKey]
		function toggleEdit() {
			setIsEditing((prev) => ({ ...prev, [editKey]: !prev[editKey] }))
		}

		return (
			<div>
				<p className="font-medium">{title}</p>
				<div className="flex justify-between items-start min-h-12">
					{isBeingEdited ? (
						<>
							{editContent}
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
						</>
					) : (
						<>
							{content}
							<button type="button" onClick={toggleEdit} className="link-primary">
								Edit
							</button>
						</>
					)}
				</div>
			</div>
		)
	}

	return (
		<div className="w-full max-w-md border-2 border-slate-100 rounded-xl p-3 flex flex-col gap-y-6">
			{/* Reusable pattern */}
			<Setting
				title="Order cut off time"
				editKey="cutOff"
				onSave={() => saveSettings('cutOffTime')}
				hasChanges={newCutOff !== user.cutOffTime} // This doesn't work
				content={<span>{formatTime(user.cutOffTime)}</span>}
				editContent={
					<input
						type="time"
						id="cutOffTime"
						value={epochDateToTimeInput(newCutOff || user.cutOffTime)}
						onChange={(event) => {
							const timeInputValue = event.target.value
							const updatedDate = timeInputToEpochDate(timeInputValue)
							setNewCutOff(updatedDate)
						}}
					/>
				}
			/>

			<Setting
				title="Lead time in days"
				editKey="leadTime"
				onSave={() => saveSettings('leadTimeDays')}
				hasChanges={newLeadTime !== user.leadTimeDays}
				content={<span>{`${user.leadTimeDays || 0} day${user.leadTimeDays !== 1 ? 's' : ''}`}</span>}
				editContent={
					<input
						type="number"
						min="0"
						className="w-16 px-2 py-1 border rounded"
						value={newLeadTime !== undefined ? newLeadTime : user.leadTimeDays || 0}
						onChange={(event) => {
							const value = Number.parseInt(event.target.value, 10)
							setNewLeadTime(value)
						}}
					/>
				}
			/>

			<Setting
				title="Minimum spend"
				editKey="minimumSpend"
				onSave={() => {
					// Placeholder for minimum spend save function
					setIsEditing((prev) => ({ ...prev, minimumSpend: false }))
				}}
				hasChanges={true} // Placeholder - would compare newMinimumSpend with user.minimumSpendPence
				content={<span>{formatPrice(user.minimumSpendPence)}</span>}
				editContent={
					<input
						type="number"
						min="0"
						step="1"
						className="w-24 px-2 py-1 border rounded"
						defaultValue={user.minimumSpendPence}
						// ToDo: Placeholder for onChange handler
					/>
				}
			/>

			<Setting
				title="Accepted delivery days"
				editKey="acceptedDeliveryDays"
				onSave={() => {
					// Placeholder for saving accepted delivery days
					setIsEditing((prev) => ({ ...prev, acceptedDeliveryDays: false }))
				}}
				hasChanges={true} // Placeholder - would compare newAcceptedDeliveryDays with acceptedDeliveryDays
				content={
					<ul className="w-full">
						{daysOfTheWeek.map(({ name, sortOrder }) => {
							const isAccepted = acceptedDeliveryDays?.some((day) => day.name.toLowerCase() === name.toLowerCase())

							return (
								<li key={sortOrder} className={`mb-1 flex items-center gap-x-2 ${!isAccepted ? 'line-through decoration-red-600' : ''}`}>
									{isAccepted ? <CheckCircleIcon className="size-6 text-green-600" /> : <XCircleIcon className="size-6 text-red-600" />}
									{name}
								</li>
							)
						})}
					</ul>
				}
				editContent={
					<div className="w-full">
						{daysOfTheWeek.map(({ name, sortOrder }) => {
							const isAccepted = acceptedDeliveryDays?.some((day) => day.name.toLowerCase() === name.toLowerCase())

							return (
								<div key={sortOrder} className="mb-1 flex items-center gap-x-2">
									<input
										type="checkbox"
										id={`day-${sortOrder}`}
										checked={isAccepted}
										// Placeholder for onChange handler
										className="h-5 w-5"
									/>
									<label htmlFor={`day-${sortOrder}`}>{name}</label>
								</div>
							)
						})}
					</div>
				}
			/>

			<Setting
				title="Holidays"
				editKey="holidays"
				onSave={() => {
					// Placeholder for saving holidays
					setIsEditing((prev) => ({ ...prev, holidays: false }))
				}}
				hasChanges={true} // Placeholder - would compare newHolidays with holidays
				content={
					containsItems(holidays) ? (
						<ul className="list-disc list-inside w-full">
							{holidays?.map(({ startDate, endDate }) => {
								if (isSameDay(startDate, endDate)) {
									return <li key={String(startDate)}>{formatDateFull(startDate)}</li>
								}

								const dayDifference = differenceInCalendarDays(endDate, startDate) + 1 // Make inclusive

								return (
									<li key={String(startDate)}>
										{formatDate(startDate)} - {formatDateFull(endDate)}
										<span className="text-zinc-600">{`, inclusive (${dayDifference} days)`}</span>
									</li>
								)
							})}
						</ul>
					) : (
						<p>No holidays set</p>
					)
				}
				editContent={
					<div className="w-full">
						{/* Placeholder for holiday editor - could be a list of existing holidays with delete buttons */}
						{holidays !== null && holidays.length > 0 && (
							<ul className="mb-4 w-full">
								{holidays.map(({ startDate, endDate }) => (
									<li key={String(startDate)} className="flex items-center justify-between mb-2">
										<span>
											{isSameDay(startDate, endDate) ? formatDateFull(startDate) : `${formatDate(startDate)} - ${formatDate(endDate)}`}
										</span>
										<button
											type="button"
											className="text-red-500"
											// Placeholder for delete handler
										>
											Remove
										</button>
									</li>
								))}
							</ul>
						)}

						{/* Add new holiday controls */}
						<div className="flex flex-col gap-2 border-t pt-2">
							<p className="text-sm font-medium">Add new holiday</p>
							<div className="flex gap-2">
								<div>
									<label htmlFor="holiday-start" className="text-xs block">
										Start
									</label>
									<input
										type="date"
										id="holiday-start"
										className="border p-1 rounded"
										// Placeholder for onChange handler
									/>
								</div>
								<div>
									<label htmlFor="holiday-end" className="text-xs block">
										End
									</label>
									<input
										type="date"
										id="holiday-end"
										className="border p-1 rounded"
										// Placeholder for onChange handler
									/>
								</div>
								<button
									type="button"
									className="self-end px-2 py-1 bg-blue-100 rounded"
									// Placeholder for add holiday handler
								>
									Add
								</button>
							</div>
						</div>
					</div>
				}
			/>
		</div>
	)
}
