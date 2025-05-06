'use client'
import type { SettingsGETresponse, SettingsPATCHbody, SettingsPATCHresponse } from '@/app/api/settings/route'
import { useNotifications } from '@/components/providers/notifications'
import { useUser } from '@/components/providers/user'
import { daysOfTheWeek, userMessages } from '@/library/constants'
import {
	apiRequest,
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
import { useEffect, useRef, useState } from 'react'

export function EditSettings() {
	const { user, setUser } = useUser()
	const { createNotification } = useNotifications()

	const [editCutOff, setEditCutOff] = useState(false)
	const [newCutOff, setNewCutOff] = useState<Date>(user?.cutOffTime || new Date()) // ToDo???
	const [editLeadTime, setEditLeadTime] = useState(false)
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

			if (type === 'cutOffTime') {
				setEditCutOff(false)
			} else {
				setEditLeadTime(false)
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

	return (
		<div className="w-full max-w-md border-2 border-slate-100 rounded-xl p-3 flex flex-col gap-y-3">
			<div>
				<p className="font-medium">Order cut off time</p>
				<div className="flex justify-between min-h-12">
					{(() => {
						if (editCutOff) {
							return (
								<>
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
									<button type="button" onClick={() => saveSettings('cutOffTime')} className="px-2 py-1 bg-blue-300 rounded">
										Save
									</button>
								</>
							)
						}
						if (!editCutOff) {
							return (
								<>
									<span>{formatTime(user.cutOffTime)}</span>
									<button
										type="button" //
										onClick={() => setEditCutOff(true)}
										className="link-primary"
									>
										Edit
									</button>
								</>
							)
						}
					})()}
				</div>
			</div>

			<div>
				<p className="font-medium">Lead days</p>
				<div className="flex justify-between min-h-12">
					{(() => {
						if (editLeadTime) {
							return (
								<>
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
									{(() => {
										const noLeadTimeChanges = newLeadTime === user.leadTimeDays

										// ToDo: Display cancel button whether there are changes or not

										if (noLeadTimeChanges) {
											return (
												<button
													type="button" //
													onClick={() => setEditLeadTime(false)}
													className="link-primary"
												>
													Cancel
												</button>
											)
										}
										return (
											<button
												type="button" //
												onClick={() => saveSettings('leadTimeDays')}
												className="px-2 py-1 bg-blue-300 rounded"
											>
												Save
											</button>
										)
									})()}
								</>
							)
						}

						if (!editLeadTime) {
							return (
								<>
									<span>{`${user.leadTimeDays || 0} day${user.leadTimeDays !== 1 ? 's' : ''}`}</span>
									<button
										type="button" //
										onClick={() => setEditLeadTime(true)}
										className="link-primary"
									>
										Edit
									</button>
								</>
							)
						}
					})()}
				</div>
			</div>
			<div>
				<p className="font-medium">Minimum spend</p>
				<div className="flex justify-between min-h-12">
					<p>{formatPrice(user.minimumSpendPence)}</p>
				</div>
			</div>
			<div>
				<p className="font-medium mb-2">Accepted delivery days</p>
				<ul>
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
			</div>
			<div>
				<p className="font-medium">Holidays</p>
				<ul className="list-disc list-inside">
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
			</div>
		</div>
	)
}
